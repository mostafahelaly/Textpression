import React, { useRef, useState, useEffect } from 'react'
import  { Modal, Form, Button }  from 'react-bootstrap'
import { useConversations } from '../Contexts/ConversationsProvider'
import * as tf from "@tensorflow/tfjs"
import * as handpose from "@tensorflow-models/handpose"
import * as fp from "fingerpose"
import Webcam from "react-webcam"
import { drawHand } from "./utilities"


export default function HandPoseModal({ closeModal }) {

    const webcamRef = useRef(null)
    const canvasRef = useRef(null)
    

    const { sendMessage, selectedConversation } = useConversations()
    const [text, setText] = useState('')

    function sendEmoji(pose){
        if(pose == "victory"){
            sendMessage( selectedConversation.recipients.map(r => r.id),
            "✌️"
            )
            closeModal()
        }
        
        else if(pose == "thumbs_up"){
            sendMessage( selectedConversation.recipients.map(r => r.id),
            "👍"
            )
            closeModal()
        }
    }

    const runHandpose = async () => {
        const net = await handpose.load()
        console.log("Handpose model loaded.")
        //  Loop and detect hands
        setInterval(() => {
          detect(net)
        }, 800)
    }

    const detect = async (net) => {
        // Check data is available
        if (
          typeof webcamRef.current !== "undefined" &&
          webcamRef.current !== null &&
          webcamRef.current.video.readyState === 4
        ) {
          // Get Video Properties
          const video = webcamRef.current.video
          const videoWidth = webcamRef.current.video.videoWidth
          const videoHeight = webcamRef.current.video.videoHeight
    
          // Set video width
          webcamRef.current.video.width = videoWidth
          webcamRef.current.video.height = videoHeight
    
          // Set canvas height and width
          canvasRef.current.width = videoWidth
          canvasRef.current.height = videoHeight
    
          // Make Detections
          const hand = await net.estimateHands(video)
          // console.log(hand)
        
          if (hand.length > 0) {
            const GE = new fp.GestureEstimator([
              fp.Gestures.VictoryGesture,
              fp.Gestures.ThumbsUpGesture,
            ])
            const gesture = await GE.estimate(hand[0].landmarks, 4)
            if (gesture.gestures !== undefined && gesture.gestures.length > 0) {
            //   console.log(gesture.gestures)
    
              const confidence = gesture.gestures.map(
                (prediction) => prediction.confidence
              )
              const maxConfidence = confidence.indexOf(
                Math.max.apply(null, confidence)
              )
                
              sendEmoji(gesture.gestures[maxConfidence].name)
            //   console.log(gesture.gestures[maxConfidence].name)
            //   setEmoji(gesture.gestures[maxConfidence].name)
            //   console.log(emoji)
            }
          }
        
          // Draw mesh
          const ctx = canvasRef.current.getContext("2d")
          drawHand(hand, ctx)
        }
      }
    
    useEffect(()=>{runHandpose()},[])

    return (
        <>
        <Modal.Header closeButton>Hand Pose Detection</Modal.Header>
        <Modal.Body>
            <Webcam
            ref={webcamRef}
            style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                width: 480,
                height: 360,
            }}
            />

            <canvas
            ref={canvasRef}
            style={{
                position: "absolute",
                marginLeft: "auto",
                marginRight: "auto",
                left: 0,
                right: 0,
                textAlign: "center",
                zindex: 9,
                width: 480,
                height: 360,
            }}
            />
        </Modal.Body>
   </>
    )
}