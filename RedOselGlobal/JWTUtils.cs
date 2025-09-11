using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace RedOselGlobal
{
    public class JWTUtils
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="claims"></param>
        /// <param name="secretKey"></param>
        /// <param name="issue"></param>
        /// <param name="audiences"></param>
        /// <param name="type">1 Login, 2 Refresh</param>
        /// <returns></returns>
        public static string CreateJwtToken(Claim[] claims, int type)
        {
            // Convert the secret key to a byte array
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET_KEY")));

            // Define the signing credentials using HMACSHA512
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

            // Define the token descriptor with claims and signing credentials
            var tokenDescriptor = new JwtSecurityToken(
                issuer: Environment.GetEnvironmentVariable("JWT_ISSUER"),  // Replace with your issuer (e.g., your app name or identity provider)
                audience: Environment.GetEnvironmentVariable("JWT_AUDIENCE"),  // Replace with your audience (e.g., the client or API using the token)
                claims: claims,
                expires: type.Equals(1) ? DateTime.UtcNow.AddMinutes(int.Parse(Environment.GetEnvironmentVariable("ExpireApi"))) : DateTime.UtcNow.AddMinutes(int.Parse(Environment.GetEnvironmentVariable("ExpireRefresh"))),  // Token expiration (10 minutes)
                signingCredentials: credentials,
                notBefore: DateTime.UtcNow
            );

            // Generate the JWT token using JwtSecurityTokenHandler
            return new JwtSecurityTokenHandler().WriteToken(tokenDescriptor);
        }

        public static Dictionary<string, string> GetDataFromJwt(string token)
        {
            try
            {
                var res = new Dictionary<string, string>();
                var tokenHandler = new JwtSecurityTokenHandler();

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET_KEY"))),
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER"),
                    ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
                    // set clockskew to zero so tokens expire exactly at token expiration time (instead of 5 minutes later)
                    ClockSkew = TimeSpan.Zero,
                    RequireExpirationTime = true,
                    RequireSignedTokens = true,
                    RequireAudience = true
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;

                res.Add("Name", jwtToken.Claims.FirstOrDefault(x => x.Type.Equals(ClaimTypes.Name))?.Value); // nombre del usuario
                res.Add("Role", jwtToken.Claims.FirstOrDefault(x => x.Type.Equals(ClaimTypes.Role))?.Value); // Perfil
                res.Add("IdPerfil", jwtToken.Claims.FirstOrDefault(x => x.Type.Equals(ClaimTypes.Sid))?.Value); // idPerfil
                res.Add("UserData", jwtToken.Claims.FirstOrDefault(x => x.Type.Equals(ClaimTypes.UserData))?.Value); // idUsuario
                res.Add("AuxSage", jwtToken.Claims.FirstOrDefault(x => x.Type.Equals("AuxSage"))?.Value); // idUsuario

                try
                {
                    res.Add("Surname", jwtToken.Claims.FirstOrDefault(x => x.Type.Equals(ClaimTypes.Surname))?.Value); // idUsuario
                }
                catch (Exception)
                {
                    //<
                }

                if (String.IsNullOrEmpty(res["Name"]) || String.IsNullOrEmpty(res["Role"]))
                {
                    throw new Exception("Token inválido");
                }
                else
                {
                    return res;
                }

            }
            catch (Exception)
            {
                throw;
            }
        }
        public static double GetExpirationTime(string token)
        {

            var tokenHandler = new JwtSecurityTokenHandler();

            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_SECRET_KEY"))),
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER"),
                ValidAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE"),
                // set clockskew to zero so tokens expire exactly at token expiration time (instead of 5 minutes later)
                ClockSkew = TimeSpan.Zero,
                RequireExpirationTime = true,
                RequireSignedTokens = true,
                RequireAudience = true
            }, out SecurityToken validatedToken);

            double resultado = 0;
            if (DateTime.UtcNow <= validatedToken.ValidTo)
            {
                var substractDate = validatedToken.ValidTo.Subtract(DateTime.UtcNow);
                resultado = substractDate.TotalMinutes;
            }

            return resultado;
        }
    }
}
