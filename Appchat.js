import firebase , {auth} from './firebase'
import './App.css';
import React from 'react';
import { useState, useRef } from 'react';
import { initializeApp } from 'firebase/app';
//import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { useAuthState, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { collection, getDocs } from "firebase/firestore";
import { getStorage } from 'firebase/storage';


//after creating a project in firebase ,then add a webapp
//the configuration of the chattapp
/*const firebaseConfig = {
  apiKey: "AIzaSyCzd_8inZhBnr1NXmgmLFvxfIRipEPH2Gs",
  authDomain: "chat-app-9de88.firebaseapp.com",
  projectId: "chat-app-9de88",
  storageBucket: "chat-app-9de88.firebasestorage.app",
  messagingSenderId: "425754481691",
  appId: "1:425754481691:web:b6e0d735b52a2e41b654be",
  measurementId: "G-2LR5WFQ35E"

};
firebase.initializeApp(firebaseConfig);*/

const app = initializeApp(firebaseConfig);      // "app"
const firestore = getFirestore(app);            // "firestore"
const db = getFirestore(app);
const storage = getStorage(app);
function App() {
  //Signed in:user is an object
  //Signed out :user is null
  const [formValue,setValue]=useState('');
  const inputRef = useRef();
  const[user]=useAuthState(auth);
  return (
    <div className="App">
      <header>
        
      </header>
      <section> 
         {
          //if user:show ChatRoom g
          //else:show SignIn
          user ? <ChatRoom/> : <SignIn/>
         }
      </section>
    </div>
  );
}
 function SignIn(){
  const signInWithGoogle= ()=>{
    const provider = new firebase.auth.GoogleAuthProviider();
    auth.signInWithPopup(provider);
    return (

      <button onClick={useSignInWithGoogle}>Sign in with Google</button>
    )
  }

 }
 function SignOut(){
  return auth.currentUser &&(
   <button onClick={() => auth.signOut()}>Sign Out </button> 
  ) 
 }

 //function chatroom
 function ChatRoom(){
  const dummy =useRef()
  const messagesRef= firestore.collection();
  //limit the number of messages sent to 25
  const query=messagesRef.orderBy('createdAt').limit(25);
  const[messages] =useCollectionData(query,{idField :'id'});

  const sendMessage = async(e) =>{
    e.preventDefault();
    const { uid,photoURL}=auth.currentUser;
    //create new document in firestore
    await messagesRef.add({
      text:formValue,
      createdAt:firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,

    });
    setFormValue('');
    dummy.current.scrollIntoView({ behavior:'smooth'});

  }

  return(
    <>
      <div>
        {messages && messages.map(msg => <ChatMessage key ={msg.id} message={msg} />)}
      </div>

      <div ref={dummy} ></div>


      <form onSubmit={sendMessage}>  
        
    
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
        <button type="submit"></button>


      </form>
    
    </>

  )
 }

 //function chatmessage:

 function ChatMessage(props){
  const { text,uid,photoURL }=props.message;
  //know if the message is sent or received
  const messageClass =uid === auth.currentUser.uid ? 'sent':'received';
  return (
    <div className ={`{message${messageClass}`} >
      <p>{text}</p>


    </div>
  )

 }
export default App;


/* an equivalent code:
import { useSignInWithGoogle } from "./auth";//react-firebase-hooks/auth
import { auth } from "./firebase";
import React, { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

// 🔥 Configuration Firebase (remplace par la tienne)
const firebaseConfig = {
  apiKey: "AIzaSyCzd_8inZhBnr1NXmgmLFvxfIRipEPH2Gs",
  authDomain: "chat-app-9de88.firebaseapp.com",
  projectId: "chat-app-9de88",
  storageBucket: "chat-app-9de88.appspot.com",
  messagingSenderId: "425754481691",
  appId: "1:425754481691:web:b6e0d735b52a2e41b654be",
  measurementId: "G-2LR5WFQ35E",
};

// 🔥 Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="App">
      <header>
        <h1>Chat App</h1>
        {user && <SignOut />}
      </header>

      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  //const signInWithGoogle = async () => {
    //const provider = new GoogleAuthProvider();
    //await signInWithPopup(auth, provider);
    const [signInWithGoogle] = useSignInWithGoogle(auth);
    return <button onClick={()=>signInWithGoogle()}>Sign in with Google</button>;
  };

  


function SignOut() {
  return (
    auth.currentUser && <button onClick={() => signOut(auth)}>Sign Out</button>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const [messages, setMessages] = useState([]);
  const [formValue, setFormValue] = useState("");

  useEffect(() => {
    const messagesRef = collection(db, "messages");
    //const q = query(messagesRef, orderBy("createdAt"), limit(25));
    const query = messagesRef.orderBy("createdAt").limit(25);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!formValue.trim()) return;

    const { uid, photoURL } = auth.currentUser;
    const messagesRef = collection(db, "messages");

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>

      <div ref={dummy}></div>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </>
  );
}

function ChatMessage({ message }) {
  const { text, uid, photoURL } = message;
  const messageClass = uid === auth.currentUser?.uid ? "sent" : "received";

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || "https://via.placeholder.com/40"} alt="User" />
      <p>{text}</p>
    </div>
  );
}

export default App;


*/