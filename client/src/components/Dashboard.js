import React from 'react'
import { useConversations } from '../Contexts/ConversationsProvider.js'
import CurrentConversation from './CurrentConversation.js'
import Sidebar from './Sidebar.js'
 

export default function Dashboard({ id }) {

    const { selectedConversation } = useConversations()



    return (
        <div className="d-flex" style={{ height: '100vh'}}>
            <Sidebar id ={id}/>
            {selectedConversation && <CurrentConversation/>}
        </div>
    )
}
