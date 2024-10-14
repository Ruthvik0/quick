package main

import (
	"encoding/json"
	"fmt"
	"net"
	"sync"

	webview "github.com/webview/webview_go"
)

type Message struct {
	Sender  string `json:"sender"`
	Content string `json:"content"`
}

type User struct {
	username string
	conn     net.Conn  // Connection to the user
	messages []Message // Each user has their own slice of messages
}

type Room struct {
	roomID    string
	roomOwner string
	users     []User
	messages  []Message  // Server-wide messages
	mu        sync.Mutex // Mutex for concurrent access
}

type CreateRoomResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	RoomID  string `json:"roomID"`
}

type JoinRoomResponse struct {
	Success   bool   `json:"success"`
	Error     string `json:"error"`
	OwnerName string `json:"ownerName"`
}

var room Room

func main() {
	room = Room{users: make([]User, 0), messages: make([]Message, 0)}

	// Start the webview
	w := webview.New(true)
	defer w.Destroy()
	w.SetTitle("Quick Chat")
	w.SetSize(480, 320, webview.HintNone)

	w.Navigate("http://localhost:5173/")

	// Bind the functions
	w.Bind("CreateRoom", createRoom)
	w.Bind("JoinRoom", joinRoom)
	w.Bind("SendMessage", sendMessage)
	w.Bind("GetMessages", getMessages)

	// Run the webview
	w.Run()
}

// createRoom handles the creation of a room
func createRoom(ipAddress, username string) CreateRoomResponse {
	go startTCPServer("127.0.0.1")

	room.roomID = ipAddress + ":3000"
	room.roomOwner = username

	conn, err := net.Dial("tcp", "127.0.0.1:3000")
	if err != nil {
		return CreateRoomResponse{Success: false, Error: "Could not connect to room"}
	}

	room.users = append(room.users, User{username: username, conn: conn, messages: []Message{}})
	fmt.Println("Room created and user joined:", ipAddress, username)
	return CreateRoomResponse{Success: true, RoomID: room.roomID, Error: ""}
}

// joinRoom handles users joining an existing room
func joinRoom(roomID, username string) JoinRoomResponse {
	if roomID == "" || username == "" {
		return JoinRoomResponse{Success: false, Error: "room ID and username are required"}
	}

	if room.roomID == "" || room.roomID != roomID {
		return JoinRoomResponse{Success: false, Error: "Room does not exist"}
	}

	room.mu.Lock()
	defer room.mu.Unlock()

	for _, user := range room.users {
		if user.username == username {
			return JoinRoomResponse{Success: false, Error: "User already in the room"}
		}
	}

	conn, err := net.Dial("tcp", room.roomID)
	if err != nil {
		return JoinRoomResponse{Success: false, Error: "Could not connect to room"}
	}

	newUser := User{username: username, conn: conn, messages: []Message{}}
	room.users = append(room.users, newUser)
	broadcastMessage(Message{Sender: "System", Content: username + " has joined the room!"})
	fmt.Println("User joined room:", roomID, "by:", username)
	return JoinRoomResponse{Success: true, OwnerName: room.roomOwner}
}

// sendMessage handles sending messages
func sendMessage(sender, content string) {
	room.mu.Lock()
	defer room.mu.Unlock()

	newMessage := Message{Sender: sender, Content: content}
	room.messages = append(room.messages, newMessage)

	// Append the message to the sender's messages
	// for i := range room.users {
	// 	if room.users[i].username == sender {
	// 		room.users[i].messages = append(room.users[i].messages, newMessage)
	// 		break
	// 	}
	// }

	broadcastMessage(newMessage)
}

// getMessages retrieves the message history for the specified user
func getMessages(username string) []Message {
	room.mu.Lock()
	defer room.mu.Unlock()

	for _, user := range room.users {
		if user.username == username {
			// Return a copy of the user's messages
			return append(make([]Message, 0), user.messages...)
		}
	}
	return make([]Message, 0)
}

// startTCPServer starts a TCP server on the specified address
func startTCPServer(ipAddress string) {
	listener, err := net.Listen("tcp", ipAddress+":3000")
	if err != nil {
		fmt.Println("Error starting TCP server:", err)
		return
	}
	defer listener.Close()
	fmt.Println("TCP server started on", ipAddress+":3000")

	for {
		conn, err := listener.Accept()
		if err != nil {
			fmt.Println("Error accepting connection:", err)
			continue
		}
		fmt.Println("New connection from", conn.RemoteAddr())
		go handleConnection(conn)
	}
}

// handleConnection manages communication with a connected user
func handleConnection(conn net.Conn) {
	defer conn.Close()

	for {
		messageBytes := make([]byte, 1024)
		n, err := conn.Read(messageBytes)
		if err != nil {
			fmt.Printf("Error reading message from %s: %v\n", conn.RemoteAddr(), err)
			return
		}

		var message Message
		if err := json.Unmarshal(messageBytes[:n], &message); err != nil {
			fmt.Printf("Error decoding message from %s: %v\n", conn.RemoteAddr(), err)
			continue
		}

		// Broadcast the message, including the sender
		broadcastMessage(message)
	}
}

// broadcastMessage sends a message to all users in the room
func broadcastMessage(message Message) {
	room.mu.Lock()
	defer room.mu.Unlock()

	for _, user := range room.users {
		user.messages = room.messages
		// messageJSON, _ := json.Marshal(message)
		// _, err := user.conn.Write(messageJSON)
		// if err != nil {
		// 	fmt.Printf("Error sending message to %s: %v\n", user.conn.RemoteAddr(), err)
		// }
	}
}
