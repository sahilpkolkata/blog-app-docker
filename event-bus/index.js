const express = require('express')
const app = express()
const axios = require('axios')
const bodyParser = require('body-parser')

app.use(bodyParser.json())

const events = []

app.post('/events',(req,res)=>{
   const event = req.body
   events.push(event)
    axios.post('http://posts-clusterip-srv:4000/events',event)
    axios.post('http://comments-srv:4001/events',event)
    axios.post('http://query-srv:4002/events',event)
    axios.post('http://moderation-srv:4003/events',event)


   res.send({status : 'OK'})
})

app.get('/events', (req,res)=>{
    res.send(events)
})
app.listen(4005,()=>{
    console.log("Event Bus Listening")
})