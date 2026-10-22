declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    ADMIN_EMAIL?: string;
    RESEARCH_WRITER_SHA256?: string;
    COMMENT_HASH_SALT?: string;
    BUCKET?: R2Bucket;
  }
}
