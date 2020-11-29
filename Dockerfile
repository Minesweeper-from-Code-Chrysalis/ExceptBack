FROM 054920422037.dkr.ecr.us-east-2.amazonaws.com/kang-test-repository:latest
ENV PORT=3001
EXPOSE $PORT
# COPY app.js /app/
ENTRYPOINT ["/RUN_ExceptBack.sh"]