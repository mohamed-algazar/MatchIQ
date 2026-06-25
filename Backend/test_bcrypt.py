from passlib.context import CryptContext
import sys

try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    h = pwd_context.hash("test1234")
    print("Hash successful:", h)
    v = pwd_context.verify("test1234", h)
    print("Verify successful:", v)
except Exception as e:
    print("Error:", e)
    sys.exit(1)
