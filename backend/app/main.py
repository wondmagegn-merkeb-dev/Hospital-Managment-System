from fastapi import FastAPI
from .routers import auth, user, role
from datetime import datetime
from .middleware.cors import setup_cors

app = FastAPI(
    title="Hospital Management API",
    description="An API for managing hospital operations",
    version="1.0.0"
)

# Setup CORS middleware
setup_cors(app)

@app.get("/health" , summary="Health Check", description="Check if the API is running")
def root():
    date_time = datetime.now().isoformat()
    return {"message": "Hospital Management System API Version 1.0.0 is running", "timestamp": date_time}


app.include_router(auth.authRouter)
app.include_router(user.userRouter)
app.include_router(role.roleRouter)
