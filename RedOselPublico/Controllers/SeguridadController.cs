using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.JsonWebTokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RedOselGlobal;
using System.Security.Claims;
using System.Text.Json.Nodes;

namespace RedOselPublico.Controllers
{
    [EnableRateLimiting("GlobalLimiter")]
    [Authorize]
    public class SeguridadController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private static int idUsuario;
        private static string nombre;
        private static string apellidos;
        private static string perfil;
        private static int idPerfil;



        [AllowAnonymous]
        [HttpGet]
        public IActionResult Set()
        {
            if (Request.Cookies.TryGetValue("rsh_redOsel", out string cookie))
            {
                var parts = cookie.Split(':');
                if (parts.Length != 3) return BadRequest();

                var jwtToken = EncryptionHelper.Decrypt(parts[0], parts[1], parts[2]);

                double expiration = JWTUtils.GetExpirationTime(jwtToken);
                // Validate the refresh token here
                if (expiration > 0)
                {
                    return Ok();
                }
                else
                {
                    return BadRequest();
                }
            }
            else
            {
                return BadRequest();
            }
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Salir()
        {
            Response.Cookies.Delete("rsh_redOsel");
            return Ok();
        }

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Acceso([FromBody] JsonObject body)
        {
            try
            {
                body["password"] = Utils.EncrypytPassword(body["password"].ToString());

                var user = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.UsuariosCiac_Acceso");

                var dataUser = JObject.Parse(user);
                if (int.Parse(dataUser["id_usuario"].ToString()).Equals(0))
                {
                    return BadRequest("El usuario y/o contraseña son incorrectos");
                }

                if (int.Parse(dataUser["id_estatus"].ToString()).Equals(0))
                {
                    return BadRequest("Usuario no válido, consulte con su administrador de sistema");
                }

                if (int.Parse(dataUser["id_estatus"].ToString()).Equals(2))
                {
                    return BadRequest("Usuario no válido, consulte con su administrador de sistema");
                }

                if (int.Parse(dataUser["id_estatus_perfil"].ToString()).Equals(0))
                {
                    return BadRequest("Perfil del usuario no válido, consulte con su administrador del sistema");
                }

                var claims = new[]
                {
                    new Claim(ClaimTypes.Name, dataUser["nombre"].ToString()),
                    new Claim(ClaimTypes.Surname, dataUser["apellidos"].ToString()),
                    new Claim(ClaimTypes.Role, dataUser["perfil"].ToString()),
                    new Claim(ClaimTypes.UserData, dataUser["id_usuario"].ToString()),
                    new Claim(ClaimTypes.Sid, dataUser["id_perfil"].ToString()),
                    new Claim("AuxSage", dataUser["aux_sage"].ToString()),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(JwtRegisteredClaimNames.Iat, Utils.ToUnixTimestamp(DateTime.UtcNow).ToString(), ClaimValueTypes.Integer64)
                    //new Claim(JwtRegisteredClaimNames.Iat, Utils.ToUnixTimestamp(DateTime.Now).ToString()),
                    //new Claim(JwtRegisteredClaimNames.Nbf, Utils.ToUnixTimestamp(DateTime.Now).ToString()),
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
                    idPerfil = dataUser["id_perfil"].ToString()
                };
                var res = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js), "dbo.Opciones_ConsultaMenu_UsuariosCiac");



                if (res.Length.Equals(0))
                {
                    return BadRequest("Hubo un problema al intentar acceder, consulte con su administrador de sistema");
                }
                else
                {
                    var (cipherText, tag, iv) = EncryptionHelper.Encrypt(refreshToken);

                    HttpContext.Response.Cookies.Append("rsh_redOsel", $"{cipherText}:{tag}:{iv}", new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = Request.IsHttps,
                        SameSite = SameSiteMode.Strict,
                        Expires = DateTimeOffset.UtcNow.AddHours(4)
                        //MaxAge = TimeSpan.FromHours(4)
                    });

                    return Ok(new
                    {
                        token
                    });
                }
                ;
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> VerificaC()
        {
            try
            {
                try
                {
                    await GetDatosToken();
                }
                catch (Exception)
                {
                    return Unauthorized();
                }

                var js = new
                {
                    idUsuario
                };

                var user = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js), "dbo.UsuariosCiac_Recupera");
                var obj = JObject.Parse(user);
                if (!obj["fecha_password"].ToString().IsNullOrEmpty())
                {
                    var fechaUltimoCambio = DateTime.Parse(obj["fecha_password"].ToString());
                    int days = Math.Abs(DateTime.Now.Subtract(fechaUltimoCambio).Days);

                    if (days >= 180)
                    {
                        string token = Utils.EncrypytPassword(Guid.NewGuid().ToString());
                        var js2 = new
                        {
                            idUsuario,
                            token,
                            usuario = obj["usuario"].ToString().Trim(),
                            distribuidores = 1
                        };
                        var res = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js2), "dbo.Usuario_PeticionRestablecimiento_Contrasena_JSON");
                        if (JObject.Parse(res)["mensaje"].ToString().Trim().ToLower() == "actualizado")
                        {
                            return Ok(new
                            {
                                token,
                                correoElectronico = JObject.Parse(res)["correo_electronico"].ToString()
                            });
                        }
                        //else
                        //{
                        //    return BadRequest(JObject.Parse(res)["mensaje"].ToString().Trim());
                        //}
                    }
                    return Ok(new
                    {
                        token = "",
                        correoElectronico = ""
                    });
                }
                return Ok(new
                {
                    token = "",
                    correoElectronico = ""
                });
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

        [HttpPost]
        public async Task<IActionResult> GetMenu()
        {
            try
            {
                try
                {
                    await GetDatosToken();
                }
                catch (Exception)
                {
                    return Unauthorized();
                }

                var js = new
                {
                    idPerfil,
                };
                var res = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js), "dbo.Opciones_ConsultaMenu_UsuariosCiac");
                var result = new AccesoDB(_connectionString).ConsultaMenuCiac();
                return Ok(new
                {
                    res,
                    result
                });
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

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

        [AllowAnonymous]
        [HttpPost]
        public IActionResult Rsh()
        {
            try
            {
                if (HttpContext.Request.Cookies.TryGetValue("rsh_redOsel", out var refreshToken))
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
                        nombre = data["Name"];
                        apellidos = data["Surname"];
                        perfil = data["Role"];
                        idPerfil = int.Parse(data["IdPerfil"]);
                        var auxSage = data["AuxSage"];

                        var claims = new[]
                        {
                            new Claim(ClaimTypes.Name, nombre),
                            new Claim(ClaimTypes.Surname, apellidos),
                            new Claim(ClaimTypes.Role, perfil),
                            new Claim(ClaimTypes.UserData, idUsuario.ToString()),
                            new Claim(ClaimTypes.Sid, idPerfil.ToString()),
                            new Claim("AuxSage", auxSage),
                            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                            new Claim(JwtRegisteredClaimNames.Iat, Utils.ToUnixTimestamp(DateTime.UtcNow).ToString(), ClaimValueTypes.Integer64)
                            //new Claim(JwtRegisteredClaimNames.Iat, Utils.ToUnixTimestamp(DateTime.Now).ToString()),
                            //new Claim(JwtRegisteredClaimNames.Nbf, Utils.ToUnixTimestamp(DateTime.Now).ToString()),
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
                            HttpContext.Response.Cookies.Append("rsh_redOsel", $"{cipherText}:{tag}:{iv}", new CookieOptions
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
                        return BadRequest();
                    }
                }
                else
                {
                    return BadRequest();
                }
            }
            catch (Exception)
            {
                return BadRequest();
            }
        }

        #endregion JWT

        private Task GetDatosToken()
        {
            try
            {
                var token = Request.Headers["Authorization"].ToString().Substring(0 + "bearer".Length).Trim();
                var data = JWTUtils.GetDataFromJwt(token);
                idUsuario = int.Parse(data["UserData"]);
                nombre = data["Name"];
                apellidos = data["Surname"];
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
