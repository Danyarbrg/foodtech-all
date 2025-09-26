package postgres

import (
	"os"

	"github.com/joho/godotenv"
)

func DBLoad() error {
	godotenv.Load()
	config := &database.Config
}
