const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const catchAsync = require('../utils/catchAsync')
const {insertOne,deleteOne, find} = require("../db/databaseHelper");
const AppError = require('../utils/appError');

const roomSchema = Joi.object({
    id:Joi.string().required().messages({
        "any.required":"uuid of the room is required"
    }),
    title:Joi.string().required().messages({
        "any.required":"title of the room is required"
    }),
    organization_id:Joi.string().required().messages({
        "any.required":"organization id is required"
    }),
})

exports.createRoom = catchAsync(async (req, res, next) => {
    const {organization_id,title} = req.query;
    id = uuidv4();

    // Validate the body
    await roomSchema.validateAsync({id, organization_id,title});

    const room = await insertOne("rooms", {id, organization_id,title},organization_id);

    res.status(201).json({
        status: "success",
        data: room.data
    })
});

const userSchema = Joi.object({
  room_id: Joi.string().required().messages({
    'any.required': 'room id is required',
  }),
  user_id: Joi.string().required().messages({
    'any.required': 'user id is required',
  }),
});

exports.getAllRooms = catchAsync(async (req, res, next) => {
  //const {organization_id,title} = req.query;

  const rooms = await findAll('rooms');


  if(rooms.data.length == 0){
    res.status(404).json({status: "failed", message: "Room List is empty ", data: null})
  }

  if(rooms.data.length >= 1){
    res.status(200).json({status: "success", message: "Room List found", data: rooms.data})
  }

  else{
    res.status(500).json({message: "Server Error, Try again"})
  }

});

exports.joinRoom = catchAsync(async (req, res, next) => {
  const { room_id, user_id, organization_id } = req.query;

  // Validate the body
  await userSchema.validateAsync({ room_id, user_id });

  //check that the room_id is valid
  const room = await find('rooms',{id:room_id,organization_id})

  if(room.data.data.length<=0)
  {
    return next(new AppError('Room not found',404))
  }
  //check that user isnt already in the room
  let roomuser = await find('roomusers',{room_id,user_id})

  if(roomuser.data.data.length >0)
  {
    return next(new AppError('user already in room',400))
  }

  roomuser = await insertOne('roomusers', { room_id, user_id },organization_id);

  


  res.status(201).json({
    status: 'success',
    data: roomuser.data,
  });
});


exports.removeUserFromRoom = catchAsync(async (req,res,next)=> {
    const { room_id, user_id, organization_id } = req.query;

    await userSchema.validateAsync({ room_id, user_id });

    const response = await deleteOne('roomusers',{user_id,room_id},organization_id)

    res.status(201).json({
      status: 'success',
      data: response.data,
    });
})