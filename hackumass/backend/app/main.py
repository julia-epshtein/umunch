from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import testdb



app = FastAPI(title="UMunch API")

# Allow your Expo app / frontend to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: tighten this in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}
app.include_router(testdb.router)