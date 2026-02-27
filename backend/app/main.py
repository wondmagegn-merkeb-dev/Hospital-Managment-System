from fastapi import FastAPI
from fastapi.responses import JSONResponse
from .routers import auth, user, role
from datetime import datetime
from .middleware.cors import setup_cors
import traceback
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Hospital Management API",
    description="An API for managing hospital operations",
    version="1.0.0"
)

# Setup CORS middleware (must be before routes to handle preflight/errors)
setup_cors(app)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Ensure 500 errors return proper JSON with CORS headers"""
    logger.error(f"Unhandled exception: {exc}\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "type": "internal_server_error"},
    )

@app.get("/health" , summary="Health Check", description="Check if the API is running")
def root():
    date_time = datetime.now().isoformat()
    return {"message": "Hospital Management System API Version 1.0.0 is running", "timestamp": date_time}


app.include_router(auth.authRouter)
app.include_router(user.userRouter)
app.include_router(role.roleRouter)
