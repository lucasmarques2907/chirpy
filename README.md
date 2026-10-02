## Sobre
- Chirpy é um projeto feito para praticar o desenvolvimento de API RESTful com autenticação, autorização e testes.

## TechStack
- TypeScript @ 7.0.2
- Express @ 5.0.6
- Node @ 22.14.0
- Drizzle Kit @ 0.31.11
- Vitest @ 3.2.7
- Postgres @ 3.4.9

## Rotas
Base URL: `http://localhost:<PORT>` (porta definida no `.env`).

### Autenticação
As rotas protegidas usam o header `Authorization`:
- `Bearer <token>`: access token (JWT) retornado no login, válido por 1 hora.
- `Bearer <refreshToken>`: refresh token retornado no login, válido por 60 dias. Usado apenas em `/api/refresh` e `/api/revoke`.
- `ApiKey <POLKA_KEY>`: usado apenas no webhook.

Erros retornam `{ "error": "mensagem" }` com status `400`, `401`, `403`, `404` ou `500`.

### Usuários e sessão
| Método | Rota | Auth | Body | Resposta |
|---|---|---|---|---|
| POST | `/api/users` | - | `{ email, password }` | `201` usuário criado |
| PUT | `/api/users` | Access token | `{ email, password }` | `200` usuário atualizado |
| POST | `/api/login` | - | `{ email, password }` | `200` usuário + `token` + `refreshToken` |
| POST | `/api/refresh` | Refresh token | - | `200` `{ token }` com novo access token |
| POST | `/api/revoke` | Refresh token | - | `204` refresh token revogado |

Usuário: `{ id, email, createdAt, updatedAt, isChirpyRed }`.

### Chirps
| Método | Rota | Auth | Body | Resposta |
|---|---|---|---|---|
| GET | `/api/chirps` | - | - | `200` lista de chirps |
| GET | `/api/chirps/:chirpId` | - | - | `200` chirp, `404` se não existir |
| POST | `/api/chirps` | Access token | `{ body }` | `201` chirp criado |
| DELETE | `/api/chirps/:chirpId` | Access token | - | `204` removido, `403` se não for o autor |

- `GET /api/chirps` aceita os query params `authorId` (filtra por autor) e `sort=asc|desc` (ordena por data de criação, padrão `asc`).
- `body` aceita no máximo 140 caracteres. As palavras `kerfuffle`, `sharbert` e `fornax` são trocadas por `****`.

Chirp: `{ id, createdAt, updatedAt, body, userId }`.

### Webhooks
| Método | Rota | Auth | Body | Resposta |
|---|---|---|---|---|
| POST | `/api/polka/webhooks` | ApiKey | `{ event, data: { userId } }` | `204` ok, `404` se o usuário não existir |

Apenas o evento `user.upgraded` tem efeito: marca o usuário como Chirpy Red (`isChirpyRed: true`). Outros eventos retornam `204` sem fazer nada.

### Admin e utilitários
| Método | Rota | Auth | Resposta |
|---|---|---|---|
| GET | `/api/healthz` | - | `200` texto `OK` |
| GET | `/admin/metrics` | - | `200` HTML com o número de visitas em `/app` |
| POST | `/admin/reset` | - | Zera as visitas e apaga todos os usuários (e seus chirps). Só funciona com `PLATFORM=dev`, caso contrário `403` |
| GET | `/app/*` | - | Arquivos estáticos de `src/app`. Cada acesso conta como uma visita |

