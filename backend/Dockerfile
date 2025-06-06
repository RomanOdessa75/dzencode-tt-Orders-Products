FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

RUN if [ -f tsconfig.json ]; then npm install --only=dev && npx tsc; fi

RUN if [ -d prisma ]; then npx prisma generate; fi

EXPOSE 3001

CMD ["npm", "run", "start"] 