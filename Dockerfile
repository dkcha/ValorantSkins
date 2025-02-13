FROM python:alpine
RUN pip3 install \\
	boto3 \\
	flask \\
	pytest \\
	requests
COPY . /app
WORKDIR app
ENTRYPOINT \[ "flask" \]
CMD \[ "run", "--host", "0.0.0.0" \]