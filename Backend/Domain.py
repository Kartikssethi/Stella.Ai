from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict
import uuid
import os
import google.generativeai as genai


app = FastAPI(title="AI Writing Copilot")

SESSIONS = {}

DOMAIN_PROMPTS = {
    "creative": "You are a creative writing assistant. Help with stories, characters, plots, and imaginative prose.",
    "technical": "You are a technical writing assistant. Focus on clarity, structure, accuracy, and proper terminology.",
    "legal": "You are a legal writing assistant. Provide formal tone, cite precedents, and ensure legal accuracy."
}

