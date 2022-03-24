

def compare_str(a: str, b: str):
    if not isinstance(a, str):
        a = str(a)
    if not isinstance(b, str):
        b = str(b)
    str_a, str_b = a.lower(), b.lower()
    return str_a == str_b

