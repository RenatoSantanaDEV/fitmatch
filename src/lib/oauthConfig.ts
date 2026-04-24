export type OauthProviderFlags = {
  google: boolean;
  facebook: boolean;
  apple: boolean;
};

export function getOauthProviderFlags(): OauthProviderFlags {
  return {
    google: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    facebook: !!(process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET),
    apple: !!(process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET),
  };
}
