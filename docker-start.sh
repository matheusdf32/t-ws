printf "\n\n\nNpm install:"
npm install
printf "\n\n\nCopy .env file:"
file="./.env.docker"
if [ -s "$file" ]
then
	printf "$file found."
	cp $file ./.env
	printf ".env created"
else
	printf "$file not found.\n\n\n"
	exit 1
fi

printf "\n\n\nStart node server:"
nodemon server.js