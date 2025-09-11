using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RedOselGlobal;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json.Nodes;

namespace RedOsel.Controllers
{
    [EnableRateLimiting("GlobalLimiter")]
    [Authorize]
    public class AdministracionController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;


        [AllowAnonymous]
        [HttpGet]
        [Route("")]
        [Route("Login")]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Login()
        {
            Response.Cookies.Delete("rsh_token");
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [Route("~/Recuperacion")]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult RecuperacionContrasena()
        {
            return View();
        }

        [AllowAnonymous]
        [HttpGet]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Inicio()
        {
            return View();
        }


        #region Metodos

        [AllowAnonymous]
        [HttpPost]
        public IActionResult ValidaAcceso([FromForm] string usuario, [FromForm] string password)
        {
            try
            {
                var contrasena = Utils.EncrypytPassword(password);
                var user = new AccesoDB(_connectionString).Usuario_Acceso(usuario, contrasena);

                if (user.mensaje == "")
                {
                    if (user.id_usuario.Equals(0))
                    {
                        return BadRequest("El usuario y/o contraseña son incorrectos");
                    }

                    if (user.id_estatus.Equals(0))
                    {
                        return BadRequest("Usuario no válido, consulte con su administrador de sistema");
                    }

                    if (user.id_estatus_perfil.Equals(0))
                    {
                        return BadRequest("Perfil del usuario no válido, consulte con su administrador del sistema");
                    }

                    var claims = new[]
                    {
                        new Claim(ClaimTypes.Name, user.nombre + " " + user.apellidos),
                        new Claim(ClaimTypes.Role, user.perfil),
                        new Claim(ClaimTypes.UserData, user.id_usuario.ToString()),
                        new Claim(ClaimTypes.Sid, user.id_perfil.ToString()),
                        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                        new Claim(JwtRegisteredClaimNames.Iat, Utils.ToUnixTimestamp(DateTime.UtcNow).ToString(), ClaimValueTypes.Integer64)
                        //new Claim(JwtRegisteredClaimNames.Nbf, Utils.ToUnixTimestamp(DateTime.UtcNow).ToString(), ClaimValueTypes.Integer64),
                    };

                    var token = JWTUtils.CreateJwtToken(
                        claims: claims,
                        type: 1
                        );

                    var refreshToken = JWTUtils.CreateJwtToken(
                        claims: claims,
                        type: 2
                        );

                    var js = new
                    {
                        idPerfil = user.id_perfil,
                        tipoAdministrador = 1
                    };
                    var res = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js), "dbo.Opciones_ConsultaMenu");

                    var listaMenu = JArray.Parse(res);
                    string vista = listaMenu[0]["subopciones"]?.Count() == 0
                        ? listaMenu[0]["pagina"]?.ToString()
                        : listaMenu[0]["subopciones"]?[0]["pagina"]?.ToString();

                    string controller = listaMenu[0]["subopciones"]?.Count() == 0
                        ? listaMenu[0]["controller"]?.ToString()
                        : listaMenu[0]["subopciones"]?[0]["controller"]?.ToString();

                    if (vista == null || controller == null || vista == "LogOut")
                    {
                        return BadRequest("Hubo un problema al intentar acceder, consulte con su administrador de sistema");
                    }
                    else
                    {
                        var (cipherText, tag, iv) = EncryptionHelper.Encrypt(refreshToken);

                        HttpContext.Response.Cookies.Append("rsh_token", $"{cipherText}:{tag}:{iv}", new CookieOptions
                        {
                            HttpOnly = true,
                            Secure = Request.IsHttps,
                            SameSite = SameSiteMode.Strict,
                            Expires = DateTimeOffset.UtcNow.AddHours(4),
                            //MaxAge = TimeSpan.FromHours(4)
                        });

                        return Ok(new
                        {
                            token
                        });
                    }
                }
                else
                {
                    return BadRequest(user.mensaje);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult RestablecerContrasena([FromBody] JsonObject body)
        {
            var res = "";
            try
            {
                string token = Utils.EncrypytPassword(Guid.NewGuid().ToString());

                var js = new
                {
                    usuario = body["usuario"].ToString(),
                    token
                };
                var result = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js), "dbo.Usuario_PeticionRestablecimiento_Contrasena_JSON");
                var jsRes = JObject.Parse(result);

                if (jsRes["mensaje"].ToString().Trim().ToLower() == "actualizado")
                {
                    var url = Utils.GetBaseUrl(this.HttpContext);
                    var bd = "<p> Estimado Sr. (a) " + jsRes["nombre"].ToString().Trim() + " </p></br>";
                    bd += "<p> Se recibió una solicitud de recuperación de contraseña para el usuario: " + body["usuario"].ToString().Trim() + ".</p>";
                    bd += "<p>En el siguiente link podrá restablecer su contraseña: <a href='" + url + "/Recuperacion/?token=" + token + "' ";
                    bd += "target='_blank'>De clic aquí para restablecer su contraseña.</a><br>Este link es válido por 30 minutos.</p>";
                    bd += "<p>Este mensaje fue generado de manera automática por el sistema de Pinturas Osel.</p>";
                    bd += "<p>En caso usted no haya realizado esta acción, reportarlo con su administrador de sistema.</p>";
                    EnvioCorreo.EnviarCorreo(jsRes["correo_electronico"].ToString().Trim(), bd, "Restablecimiento de contraseña Pinturas Osel", _connectionString);

                    return Ok();
                }
                else
                {
                    throw new Exception(jsRes["mensaje"].ToString().Trim().ToLower());
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult CambiaContrasena([FromBody] JsonObject body)
        {
            var tok = "";
            try
            {
                string token = body["token"].ToString();
                string contrasena = body["contrasena"].ToString();
                var password = Utils.EncrypytPassword(contrasena);

                var js = new
                {
                    token,
                    password
                };
                var res = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js), "dbo.Usuario_RestableceContrasena_JSON");
                var jsResult = JObject.Parse(res);

                if (jsResult["mensaje"].ToString().Trim().ToLower().Equals("cambiado"))
                {
                    return Ok();
                }
                else if (jsResult["mensaje"].ToString().Trim().ToLower().Equals("expirado"))
                {
                    return BadRequest("Solicitud expirada, realice una nueva solicitud");
                }
                else if (jsResult["mensaje"].ToString().Trim().ToLower().Equals("noexiste"))
                {
                    return BadRequest("Solicitud inválida");
                }
                else
                {
                    return BadRequest("Error de solicitud");
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        #endregion Metodos



        #region JWT

        [HttpPost]
        public IActionResult ValidateJwt()
        {
            try
            {
                var token = Request.Headers["Authorization"].ToString()[(0 + "bearer".Length)..].Trim();
                var result = JWTUtils.GetDataFromJwt(token);

                if (result.Count > 0)
                {
                    return Ok(result);
                }
                else
                {
                    return Unauthorized();
                }
            }
            catch (Exception)
            {
                return Unauthorized();
            }
        }

        [HttpPost]
        public async Task<IActionResult> GetMenu()
        {
            try
            {
                await GetDatosToken();

                var js = new
                {
                    idPerfil = idPerfil,
                    tipoAdministrador = 1
                };
                var res = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js), "dbo.Opciones_ConsultaMenu");
                //var res = new AccesoDB(_connectionString).Opciones_Consulta_Menu(idPerfil, 1);
                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult TiempoSesion()
        {
            try
            {
                var token = Request.Headers["Authorization"].ToString()[(0 + "bearer".Length)..].Trim();
                double expiration = JWTUtils.GetExpirationTime(token);
                return Ok(expiration);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message
                    );
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Rsh()
        {
            try
            {
                if (HttpContext.Request.Cookies.TryGetValue("rsh_token", out var refreshToken))
                {
                    var parts = refreshToken.Split(':');
                    if (parts.Length != 3) throw new Exception("Error");

                    var jwtToken = EncryptionHelper.Decrypt(parts[0], parts[1], parts[2]);

                    double expiration = JWTUtils.GetExpirationTime(jwtToken);
                    // Validate the refresh token here
                    if (expiration > 0)
                    {
                        var data = JWTUtils.GetDataFromJwt(jwtToken);
                        idUsuario = int.Parse(data["UserData"]);
                        user = data["Name"];
                        perfil = data["Role"];
                        idPerfil = int.Parse(data["IdPerfil"]);

                        var claims = new[]
                        {
                            new Claim(ClaimTypes.Name, user),
                            new Claim(ClaimTypes.Role, perfil),
                            new Claim(ClaimTypes.UserData, idUsuario.ToString()),
                            new Claim(ClaimTypes.Sid, idPerfil.ToString()),
                            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                            new Claim(JwtRegisteredClaimNames.Iat, Utils.ToUnixTimestamp(DateTime.UtcNow).ToString(), ClaimValueTypes.Integer64)
                            //new Claim(JwtRegisteredClaimNames.Nbf, Utils.ToUnixTimestamp(DateTime.UtcNow).ToString(), ClaimValueTypes.Integer64),
                        };

                        var token = JWTUtils.CreateJwtToken(
                            claims: claims,
                            type: 1
                            );

                        var rshToken = JWTUtils.CreateJwtToken(
                            claims: claims,
                            type: 2
                            );


                        var (cipherText, tag, iv) = EncryptionHelper.Encrypt(rshToken);

                        if (expiration <= 30)
                        {
                            HttpContext.Response.Cookies.Append("rsh_token", $"{cipherText}:{tag}:{iv}", new CookieOptions
                            {
                                HttpOnly = true,
                                Secure = Request.IsHttps,
                                SameSite = SameSiteMode.Strict,
                                Expires = DateTimeOffset.UtcNow.AddHours(4),
                                //MaxAge = TimeSpan.FromHours(4)
                            });
                        }

                        return Ok(new
                        {
                            token
                        });
                    }
                    else
                    {
                        return Forbid();
                    }
                }
                else
                {
                    return Forbid();
                }
            }
            catch (Exception)
            {
                return Forbid();
            }
        }

        #endregion JWT

        [HttpPost]
        public IActionResult GetClaves([FromBody] JsonObject body)
        {
            try
            {
                var res = new AccesoDB(_connectionString).GetClaves(body["idTipoClave"].GetValue<int>(), body["opcion"]?.GetValue<int>() ?? 0);
                return Ok(res);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        private Task GetDatosToken()
        {
            try
            {
                var token = Request.Headers["Authorization"].ToString().Substring(0 + "bearer".Length).Trim();
                var data = JWTUtils.GetDataFromJwt(token);
                idUsuario = int.Parse(data["UserData"]);
                user = data["Name"];
                perfil = data["Role"];
                idPerfil = int.Parse(data["IdPerfil"]);
                return Task.CompletedTask;
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}

