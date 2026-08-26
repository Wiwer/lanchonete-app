// app/api/docs/route.ts
import { NextResponse } from 'next/server'
import openapi from './openapi.json'

export async function GET() {
  return NextResponse.json(openapi, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}