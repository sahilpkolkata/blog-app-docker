const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const { randomBytes } = require('crypto')
const axios = require('axios')
app.use(bodyParser.json()) 
app.use(cors())
const commentsPostId = {}
app.get('/posts/:id/comments',(req,res)=>{
    res.status(201).send(commentsPostId[req.params.id] || [])

})
app.post('/posts/:id/comments',async (req,res)=>{
    const commentId = randomBytes(4).toString('hex')
    const { content } = req.body
    const comments = commentsPostId[req.params.id] || []
    comments.push({
        id : commentId, content, status:'pending'
    })

    commentsPostId[req.params.id] = comments
    await axios.post('http://event-bus-srv:4005/events',{
        type: 'CommentCreated',
        data: {
            id: commentId, 
            content,
            postId: req.params.id,
            status: 'pending'
        }
    })

    res.status(201).send(comments)
})
app.post('/events',async (req,res)=>{
    console.log('Received event',req.body.type)

    const {type, data}= req.body
    if(type==='CommentModerated'){
        const { id, postId, status, content } = data
        const comments = commentsPostId[postId]
        const comment = comments.find( comment =>{
            return comment.id === id
        })
        comment.status = status
        await axios.post('http://event-bus-srv:4005/events',{
            type: 'CommentUpdated',
            data:{
                id, 
                status,
                postId, 
                content
            }
        })
    }
    
    res.send({})
})


app.listen(4001,()=>{
    console.log("Comments Listening")
})