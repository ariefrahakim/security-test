# Week 1 — Setup + HTTP from scratch

**Goal:** labs running; you can intercept & modify any request/response in Burp.

## Daily checklist

- [ ] **Mon** — Install Burp Community, dedicated Firefox profile, Burp CA cert. Intercept 5 requests from Juice Shop, modify 1 response.
- [ ] **Tue** — HTTP anatomy: methods, key headers (Host, Origin, Referer, Cookie, Authorization, Content-Type), status codes. PortSwigger "Getting started" + master Repeater.
- [ ] **Wed** — Encoding: URL, HTML entity, Base64, Unicode, double-encoding. Burp Decoder drill: encode/decode 10 nested payloads.
- [ ] **Thu** — Modern web structure: SPA, REST, GraphQL, BFF, reverse proxy, CDN, WAF. Diagram one Hubexo app's architecture on a single page.
- [ ] **Fri** — Set up Docker labs (Juice Shop, DVWA, VAmPI). Write repo README (done).

## Lab setup commands

```bash
# Juice Shop — main practice target (modern SPA)
docker run --rm -d -p 3000:3000 --name juice-shop bkimminich/juice-shop

# DVWA — classic, PHP
docker run --rm -d -p 8080:80 --name dvwa vulnerables/web-dvwa

# VAmPI — vulnerable API (Python/Flask)
docker run --rm -d -p 5000:5000 --name vampi erev0s/vampi

# Verify
curl -sI http://localhost:3000 | head -1  # Juice Shop
curl -sI http://localhost:8080 | head -1  # DVWA
curl -s  http://localhost:5000/            # VAmPI (JSON)
```

## Daily notes

Write in `monday.md`, `tuesday.md`, etc. Use the template at `/templates/daily-note.md`.
