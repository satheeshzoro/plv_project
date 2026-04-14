"for docker-compose up and then running the container actually ?"

Exactly. Here is the flow of commands you would eventually run:

docker-compose up -d: This starts your backend, frontend, and the "Stage 1" Nginx.

docker-compose run --rm certbot...: This starts a temporary Certbot container just to go grab the certificates and then disappear.

(Edit your Nginx config to Stage 2)

docker-compose exec nginx nginx -s reload: This tells the already-running Nginx to "refresh" and look at your new HTTPS settings.