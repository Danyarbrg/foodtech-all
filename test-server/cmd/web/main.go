package main

import (
	"net/http"
	"fmt"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/home", home)

	fmt.Println("Server runs on port: 8080")

	err := http.ListenAndServe(":8080", mux)
	if err != nil {
		panic(err)
	}
}

func home(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Heeeeey!"))
}
