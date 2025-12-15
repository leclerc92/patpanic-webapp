# Configuration de Sécurité

## Headers de Sécurité (Helmet)

Le backend utilise Helmet pour ajouter automatiquement des headers de sécurité HTTP :

### Headers activés

- **X-DNS-Prefetch-Control** : Contrôle le prefetch DNS
- **X-Frame-Options** : Empêche le clickjacking (SAMEORIGIN)
- **X-Content-Type-Options** : Empêche le MIME sniffing (nosniff)
- **X-Download-Options** : Force le téléchargement des fichiers
- **Strict-Transport-Security** : Force HTTPS (HSTS)
- **X-Permitted-Cross-Domain-Policies** : Contrôle les politiques cross-domain
- **Referrer-Policy** : Contrôle les informations du referrer
- **Content-Security-Policy** : Définit les sources autorisées

### Configuration WebSocket

Le `crossOriginResourcePolicy` est désactivé pour permettre les connexions WebSocket.

## Configuration CORS

### Développement

Par défaut, les origines suivantes sont autorisées :
- `http://localhost:5173` (frontend local)
- Réseau local 192.168.x.x:5173 (via regex)
- Réseau local 10.x.x.x:5173 (via regex)

### Production

**⚠️ CRITIQUE** : En production, vous **DEVEZ** définir la variable d'environnement `ALLOWED_ORIGINS` avec vos domaines spécifiques :

```bash
# Fichier .env en production
NODE_ENV=production
ALLOWED_ORIGINS=https://votredomaine.com,https://www.votredomaine.com
```

**Ne jamais utiliser les regex en production !** Elles sont uniquement pour le développement local.

### Exemple de configuration production

```bash
# .env.production
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://patpanic.app.com,https://www.patpanic.app.com

# Si vous utilisez plusieurs sous-domaines :
# ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com,https://api.example.com
```

### Warning automatique

Le serveur affiche un warning au démarrage en production si `ALLOWED_ORIGINS` n'est pas configuré :

```
⚠️  Running in production mode. Ensure ALLOWED_ORIGINS is properly configured.
```

## Rate Limiting

Le backend utilise `@nestjs/throttler` pour limiter les requêtes WebSocket :

- **100 requêtes maximum par minute** par client (identifié par IP)
- S'applique à tous les événements WebSocket
- Erreur retournée : `ThrottlerException: Too Many Requests`

### Personnaliser les limites

Pour ajuster les limites par événement, utilisez le décorateur `@Throttle()` :

```typescript
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 req/min
@SubscribeMessage('validate')
handleValidate(@ConnectedSocket() client: GameSocket) {
  // ...
}
```

## Exception Filter

Tous les événements WebSocket sont protégés par le `WsExceptionFilter` :

### Comportement

**Développement** (`NODE_ENV !== 'production'`) :
- Messages d'erreur détaillés envoyés au client
- Stack traces loggées côté serveur

**Production** :
- Messages d'erreur génériques ("Une erreur est survenue")
- Stack traces masquées pour le client
- Logs complets conservés côté serveur pour debugging

## Validation des entrées

Tous les DTOs utilisent `class-validator` pour valider les entrées :

### Exemple : Noms de joueurs

```typescript
@IsString()
@Length(2, 15)
@Matches(/^[a-zA-Z0-9\s\-_]+$/)
name: string;
```

Protection contre :
- Injection de caractères malveillants
- XSS via noms de joueurs
- Noms trop courts/longs

## Checklist avant production

- [ ] Définir `NODE_ENV=production`
- [ ] Configurer `ALLOWED_ORIGINS` avec vos domaines exacts
- [ ] Vérifier que HTTPS est activé (pour HSTS)
- [ ] Tester le rate limiting
- [ ] Vérifier les logs d'erreur (ne doivent pas exposer de stack traces)
- [ ] Vérifier que le warning CORS ne s'affiche pas au démarrage
- [ ] Désactiver les regex CORS dans le code si nécessaire

## Recommandations additionnelles

### À implémenter (non fait actuellement)

1. **Authentification WebSocket** : Ajouter JWT ou session-based auth
2. **Validation des variables d'environnement** : Utiliser `@nestjs/config` avec Joi
3. **Persistance** : Migrer vers Redis pour l'état partagé
4. **Monitoring** : Intégrer Sentry pour le tracking d'erreurs
5. **Health checks** : Ajouter `@nestjs/terminus`

Voir `audit.md` pour la liste complète des améliorations recommandées.