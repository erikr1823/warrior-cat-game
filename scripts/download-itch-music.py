import re
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("Install requests: pip install requests")
    sys.exit(1)

GAME_URL = "https://kmontesdev.itch.io/7-fantasy-music-tracks"
PURCHASE_URL = f"{GAME_URL}/purchase"
TRACK_CANDIDATES = [
    ("Awakening.mp3", "13384695"),
    ("Shores of Yore.mp3", "13384697"),
]
OUT = Path(__file__).resolve().parent.parent / "src" / "assets" / "audio" / "menu-theme.mp3"


def get_csrf(session):
    page = session.get(PURCHASE_URL, timeout=30)
    page.raise_for_status()
    match = re.search(r'name="csrf_token"\s+value="([^"]+)"', page.text)
    if not match:
        raise RuntimeError("Could not find itch.io CSRF token.")
    return match.group(1)


def claim_free_download(session, csrf):
    response = session.post(
        PURCHASE_URL,
        data={"price": "0", "csrf_token": csrf},
        headers={
            "Referer": PURCHASE_URL,
            "Origin": "https://kmontesdev.itch.io",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout=30,
        allow_redirects=False,
    )

    if response.status_code in (301, 302, 303, 307, 308):
        location = response.headers.get("Location", "")
        if location.startswith("/"):
            location = f"https://kmontesdev.itch.io{location}"
        download_page = session.get(location, timeout=30)
        download_page.raise_for_status()
        return download_page.text, download_page.url

    download_page = session.get(f"{GAME_URL}?download", headers={"Referer": PURCHASE_URL}, timeout=30)
    download_page.raise_for_status()
    return download_page.text, download_page.url


def extract_download_token(page_html, page_url):
    for source in (page_html, page_url):
        match = re.search(r"/7-fantasy-music-tracks/download/([^\"'?#]+)", source)
        if match:
            return match.group(1)
    raise RuntimeError("Could not find itch.io download token.")


def download_track(session, page_html, page_url):
    token = extract_download_token(page_html, page_url)
    referer = f"{GAME_URL}/download/{token}"

    for track_name, upload_id in TRACK_CANDIDATES:
        file_url = f"{GAME_URL}/file/{upload_id}?source=game_download"
        response = session.get(
            file_url,
            stream=True,
            timeout=60,
            headers={"Referer": referer},
            allow_redirects=True,
        )
        response.raise_for_status()

        content_type = response.headers.get("content-type", "")
        if "text/html" in content_type:
            continue

        OUT.parent.mkdir(parents=True, exist_ok=True)
        with OUT.open("wb") as handle:
            for chunk in response.iter_content(chunk_size=65536):
                if chunk:
                    handle.write(chunk)

        print(f"Saved {track_name} -> {OUT}")
        return

    raise RuntimeError("Could not download itch.io music. Run npm run setup:music to install King's Feast.")


def main():
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        }
    )
    csrf = get_csrf(session)
    page_html, page_url = claim_free_download(session, csrf)
    download_track(session, page_html, page_url)


if __name__ == "__main__":
    main()
