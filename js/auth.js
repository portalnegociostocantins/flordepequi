/* Acesso ao painel. Guarda só um código embaralhado (SHA-256 com sal), nunca a senha em texto.
   Para trocar a senha, gere um novo código e substitua "hash" e "salt" abaixo (veja o README).
   Atenção: em site estático isso só afasta curiosos. A proteção real das publicações é o token do GitHub. */
window.ADMIN_AUTH = { salt: "ead456f1bf4bca9d7ee3e55e4f3100f1", hash: "27dd53dedb15391d3f7095cb3de7fd4491e67fe76488995aab74ed4c477dead6" };
