package main

import (
	"encoding/json"
	"fmt"
	"net"
	"sync"
	"time"

	webview "github.com/webview/webview_go"
)

type Message struct {
	Sender  string `json:"sender"`
	Content string `json:"content"`
	Type    string `json:"type"` // "chat", "join", "quit"
}

type User struct {
	username string
	conn     net.Conn
}

type Room struct {
	roomID    string
	roomOwner string
	users     []User
	mu        sync.Mutex // Mutex for concurrent access
}

type CreateRoomResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
	RoomID  string `json:"roomID"`
}

var room Room

func main() {
	room = Room{users: make([]User, 0)}

	// Start the webview
	w := webview.New(true)
	defer w.Destroy()
	w.SetTitle("Quick Chat")
	w.SetSize(480, 320, webview.HintNone)

	w.Navigate("http://localhost:5173/")

	// Bind the functions
	w.Bind("CreateRoom", createRoom)

	// Run the webview
	w.Run()
}

// createRoom handles the creation of a room
func createRoom(ipAddress, username string) CreateRoomResponse {
	go startTCPServer("127.0.0.1")

	room.roomID = ipAddress + ":3000"
	room.roomOwner = username

	fmt.Println("Room created ", ipAddress)
	return CreateRoomResponse{Success: true, RoomID: room.roomID, Error: ""}
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

	var username string

	// Read the initial username
	if err := conn.SetReadDeadline(time.Now().Add(5 * time.Second)); err != nil {
		fmt.Printf("Error setting deadline: %v\n", err)
		return
	}

	usernameBytes := make([]byte, 1024)
	n, err := conn.Read(usernameBytes)
	if err != nil {
		fmt.Printf("Error reading username from %s: %v\n", conn.RemoteAddr(), err)
		return
	}
	username = string(usernameBytes[:n])

	room.mu.Lock()
	room.users = append(room.users, User{username: username, conn: conn})
	room.mu.Unlock()

	broadcastMessage(Message{Sender: username, Type: "join", Content: fmt.Sprintf("%s has joined the chat!", username)})

	// Handle incoming messages
	for {
		messageBytes := make([]byte, 1024)
		n, err := conn.Read(messageBytes)
		if err != nil {
			fmt.Printf("Error reading message from %s: %v\n", conn.RemoteAddr(), err)
			break
		}

		var message Message
		if err := json.Unmarshal(messageBytes[:n], &message); err != nil {
			fmt.Printf("Error decoding message from %s: %v\n", conn.RemoteAddr(), err)
			continue
		}

		// Broadcast the message
		broadcastMessage(message)
	}

	// User disconnected
	room.mu.Lock()
	defer room.mu.Unlock()
	broadcastMessage(Message{Sender: username, Type: "quit", Content: fmt.Sprintf("%s has left the chat.", username)})
}

// broadcastMessage sends a message to all users in the room
func broadcastMessage(message Message) {
	room.mu.Lock()
	defer room.mu.Unlock()

	for _, user := range room.users {
		messageBytes, _ := json.Marshal(message)
		_, err := user.conn.Write(messageBytes)
		if err != nil {
			fmt.Printf("Error sending message to %s: %v\n", user.username, err)
		}
	}
}
