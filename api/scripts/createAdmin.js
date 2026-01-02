// Script para criar o primeiro usuário admin
// Execute: node scripts/createAdmin.js

import { MongoClient } from 'mongodb'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://usuario:senha@cluster.mongodb.net/aecac'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aecac.org.br'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const ADMIN_NAME = process.env.ADMIN_NAME || 'Administrador'

async function createAdmin() {
  try {
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db('aecac')
    const usersCollection = db.collection('users')
    
    // Verificar se já existe um admin
    const existingAdmin = await usersCollection.findOne({ email: ADMIN_EMAIL })
    if (existingAdmin) {
      console.log('Admin já existe!')
      await client.close()
      return
    }
    
    // Criar hash da senha
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
    
    // Criar usuário admin
    const result = await usersCollection.insertOne({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      createdAt: new Date(),
    })
    
    console.log('Admin criado com sucesso!')
    console.log('Email:', ADMIN_EMAIL)
    console.log('Senha:', ADMIN_PASSWORD)
    console.log('ID:', result.insertedId)
    
    await client.close()
  } catch (error) {
    console.error('Erro ao criar admin:', error)
    process.exit(1)
  }
}

createAdmin()

