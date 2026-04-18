import sys
print("starting")
try:
    print("importing fastapi")
    import fastapi
    print("importing database")
    try:
        import database
    except Exception as e:
        print("database error:", e)
    print("importing auth")
    import auth
    print("importing documents")
    import documents
    print("importing chat")
    import chat
    print("importing learning")
    import learning
    print("done")
except Exception as e:
    print("Error:", type(e), e)
