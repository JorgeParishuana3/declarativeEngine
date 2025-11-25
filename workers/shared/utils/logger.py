import datetime

def log_info(*args):
    print(f"[INFO {datetime.datetime.utcnow()}]", *args)

def log_warn(*args):
    print(f"[WARN {datetime.datetime.utcnow()}]", *args)

def log_error(*args):
    print(f"[ERROR {datetime.datetime.utcnow()}]", *args)
