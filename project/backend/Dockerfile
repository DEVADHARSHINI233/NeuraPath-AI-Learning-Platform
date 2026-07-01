FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Seed the demo database at image build time so the container works out of the box.
RUN python seed_data.py

EXPOSE 5000
ENV FLASK_DEBUG=0

CMD ["python", "app.py"]
