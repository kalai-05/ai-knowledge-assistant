from google import genai
from app.database import settings

client = genai.Client(api_key=settings.gemini_api_key)

result = client.models.embed_content(
    model="gemini-embedding-001",
    contents="FastAPI is a Python framework for building APIs."
)

embedding = result.embeddings[0].values

print("Embedding successful")
print("Embedding dimension:", len(embedding))
print("First 5 values:", embedding[:5])