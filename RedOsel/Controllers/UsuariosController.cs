using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RedOselGlobal;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace RedOsel.Controllers
{
    [Authorize]
    [EnableRateLimiting("GlobalLimiter")]
    public class UsuariosController : Controller
    {
        private readonly string _connectionString = Environment.GetEnvironmentVariable("ConnectionString");
        private readonly string _connectionStringPO2014 = Environment.GetEnvironmentVariable("ConnectionStringPO2014");
        private static int idUsuario;
        private static string user;
        private static string perfil;
        private static int idPerfil;

        [AllowAnonymous]
        [HttpGet]
        [Route("/[controller]/Usuarios")]
        [Route("~/Distribuidores/Usuarios")]
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Usuarios()
        {
            ViewBag.Title = Request.Path.Value.ToString().Contains("Distribuidores") ? "Usuarios Distribuidor" : "Usuarios Internos";
            ViewBag.tipo = Request.Path.Value.ToString().Contains("Distribuidores") ? 1 : 0;
            return View();
        }


        #region Metodos

        [HttpPost]
        public IActionResult UsuariosConsulta([FromBody] JsonObject body)
        {
            try
            {

                if (int.Parse(body["tipo"].ToString()).Equals(0))
                {
                    var result = new AccesoDB(_connectionString).GetUsuarios(body["usuario"].ToString(), body["correo"].ToString());
                    return Ok(result);
                }
                else
                {
                    var result = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.UsuariosCiac_Consulta");
                    return Ok(result);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult UsuarioRecupera([FromBody] JsonObject body)
        {
            try
            {
                if (int.Parse(body["tipo"].ToString()).Equals(0))
                {
                    var res = new AccesoDB(_connectionString).GetUsuario(int.Parse(body["idUsuario"].ToString()));
                    return Json(res);
                }
                else
                {
                    var res = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.UsuariosCiac_Recupera");
                    return Ok(res);
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult UsuarioInserta([FromBody] JsonObject body)
        {
            try
            {
                //if (IsValidEmail(body["correo"].ToString()))
                //{
                    if (int.Parse(body["tipo"].ToString()).Equals(0))
                    {
                        var password = EncrypytPassword(body["contrasena"].ToString());
                        var res = new AccesoDB(_connectionString).UsuarioInserta(
                            usuario: body["usuario"].ToString(),
                            contrasena: password,
                            nombre: body["nombre"].ToString(),
                            apellidos: body["apellidos"].ToString(),
                            correo: body["correo"].ToString(),
                            telefono: body["telefono"].ToString(),
                            id_perfil: int.Parse(body["idPerfil"].ToString()),
                            id_estatus: int.Parse(body["idEstatus"].ToString())
                            );
                    }
                    else
                    {
                        var password = EncrypytPassword(body["contrasena"].ToString());
                        var js = new
                        {
                            usuario = body["usuario"].ToString(),
                            contrasena = password,
                            nombre = body["nombre"].ToString(),
                            apellidos = body["apellidos"].ToString(),
                            correo = body["correo"].ToString(),
                            encargado = body["encargado"].ToString(),
                            id_perfil = int.Parse(body["idPerfil"].ToString()),
                            id_estatus = int.Parse(body["idEstatus"].ToString()),
                            id_usuario = int.Parse(body["idUsuarioModifica"].ToString()),
                            usuarioAuxSage = body["usuarioAuxSage"].ToString(),
                            idZonaVentas = int.Parse(body["idZonaVentas"].ToString()),
                            idVendedor = int.Parse(body["idVendedor"].ToString())
                        };
                        var result = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(js), "dbo.UsuariosCiac_Inserta");

                        if (!JObject.Parse(result)["resultado"].ToString().IsNullOrEmpty())
                        {
                            throw new Exception(JObject.Parse(result)["resultado"].ToString());
                        }

                        int id_anterior = new AccesoDB(_connectionStringPO2014).UsuarioInsertaCiacPO2014(
                                body["usuario"].ToString(),
                                body["nombre"].ToString(),
                                body["apellidos"].ToString(),
                                int.Parse(body["idEstatus"].ToString()) == 1 ? 1:0,
                                body["encargado"].ToString(),
                                body["usuarioAuxSage"].ToString()
                            );
                        if (id_anterior == 0) {
                            throw new Exception("Error al insertar el usuario en el sistema de Presupuesto de Publicidad.");
                        }

                        var resultActualiza = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(new { id_anterior = id_anterior, id_usuario_ciac = JObject.Parse(result)["id_usuario_ciac"] }), "dbo.UsuarioCiac_Actualiza_IdAnterior");
                        if (!JObject.Parse(resultActualiza)["mensaje"].ToString().IsNullOrEmpty())
                        {
                            throw new Exception(JObject.Parse(result)["mensaje"].ToString());
                        }


                    }
                //}
                //else
                //{
                //    return BadRequest("El correo ingresado no tiene un formato válido");
                //}

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult UsuarioActualiza([FromBody] JsonObject body)
        {
            try
            {
                string contrasena = "";
                int cambiaContrasena = 0;
                //if (IsValidEmail(body["correo"].ToString()))
                //{
                    if (int.Parse(body["tipo"].ToString()).Equals(0))
                    {
                        if (!body["contrasena"].GetValue<string>().IsNullOrEmpty())
                        {
                            var datosUsuario = new AccesoDB(_connectionString).GetUsuario(int.Parse(body["idUsuario"].ToString()));

                            string password = EncrypytPassword(body["contrasena"].ToString().Trim());
                            if (!password.Equals(datosUsuario.contrasena))
                            {
                                contrasena = password;
                                cambiaContrasena = 1;
                            }
                        }

                        var res = new AccesoDB(_connectionString).UsuarioActualiza(
                          id_usuario: int.Parse(body["idUsuario"].ToString()),
                          usuario: body["usuario"].ToString(),
                          contrasena: contrasena,
                          nombre: body["nombre"].ToString(),
                          apellidos: body["apellidos"].ToString(),
                          correo: body["correo"].ToString(),
                          telefono: body["telefono"].ToString(),
                          id_perfil: int.Parse(body["idPerfil"].ToString()),
                          id_estatus: int.Parse(body["idEstatus"].ToString()),
                          cambia_contrasena: cambiaContrasena,
                          origen_netcore: 1
                          );
                    }
                    else
                    {
                        var datosUsuario = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.UsuariosCiac_Recupera");
                        var jsActual = JObject.Parse(datosUsuario);
                        if (!body["contrasena"].GetValue<string>().IsNullOrEmpty())
                        {                          
                            string password = EncrypytPassword(body["contrasena"].ToString().Trim());
                            if (!password.Equals(jsActual["password"].ToString()))
                            {
                                contrasena = password;
                                cambiaContrasena = 1;
                            }
                        }

                        var a = new
                        {
                            id_usuario = int.Parse(body["idUsuario"].ToString()),
                            usuario = body["usuario"].ToString(),
                            contrasena,
                            nombre = body["nombre"].ToString(),
                            apellidos = body["apellidos"].ToString(),
                            correo = body["correo"].ToString(),
                            id_perfil = int.Parse(body["idPerfil"].ToString()),
                            id_estatus = int.Parse(body["idEstatus"].ToString()),
                            id_usuario_modifica = int.Parse(body["idUsuarioModifica"].ToString()),
                            encargado = body["encargado"].ToString(),
                            usuarioAuxAge = body["usuarioAuxSage"].ToString(),
                            cambiaContrasena,
                            idZonaVentas = int.Parse(body["idZonaVentas"].ToString()),
                            idVendedor = int.Parse(body["idVendedor"].ToString())
                        };
                        var result = new AccesoDB(_connectionString).ExecuteQuery(JsonConvert.SerializeObject(a), "dbo.UsuariosCiac_Actualiza");

                        if (!JObject.Parse(result)["resultado"].ToString().IsNullOrEmpty())
                        {
                            throw new Exception(JObject.Parse(result)["resultado"].ToString());
                        }
                        bool userUpdate = userChanges(JObject.Parse(body.ToString()),jsActual);
                        if (!userUpdate)
                        {
                            return Ok();
                        }

                        int rowsAffected = new AccesoDB(_connectionStringPO2014).UsuarioActualizaCiacPO2014(
                               body["nombre"].ToString(),
                               body["apellidos"].ToString(),
                               int.Parse(body["idEstatus"].ToString()) == 1 ? 1 : 0,
                               body["encargado"].ToString(),
                               body["usuarioAuxSage"].ToString(),
                               int.Parse(body["idAnterior"].ToString())
                               
                           );
                        if (rowsAffected == 0)
                        {
                            throw new Exception("Error al actualizar en el sistema de Presupuesto de Publicidad.");

                        }
                    }
                //}
                //else
                //{
                //    return BadRequest("El correo ingresado no tiene un formato válido");
                //}

                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }



        [HttpPost]
        public IActionResult UsuarioElimina([FromBody] JsonObject body)
        {
            try
            {
                if (int.Parse(body["tipo"].ToString()).Equals(0))
                {
                    var res = new AccesoDB(_connectionString).UsuarioElimina(int.Parse(body["idUsuario"].ToString()));
                }
                else
                {
                    var res = new AccesoDB(_connectionString).ExecuteQuery(body.ToString(), "dbo.UsuariosCiac_Elimina");

                    if (!JObject.Parse(res)["resultado"].ToString().IsNullOrEmpty())
                    {
                        throw new Exception(JObject.Parse(res)["resultado"].ToString());
                    }
                }
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        #endregion Metodos
        private static bool userChanges(JObject userNew, JObject userOld) {
            if (
                userNew["nombre"].ToString() != userOld["nombre"].ToString() ||
                userNew["apellidos"].ToString() != userOld["apellidos"].ToString() ||
                Convert.ToInt32(userNew["idEstatus"]) != Convert.ToInt32(userOld["id_estatus"])  ||
                userNew["encargado"].ToString() != userOld["encargado"].ToString() ||
                userNew["usuarioAuxSage"].ToString() != userOld["usuario_aux_sage"].ToString()
                ) {
                return true;
            }
            return false;
        }
        private static bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            try
            {
                // Normalize the domain
                email = Regex.Replace(email, @"(@)(.+)$", DomainMapper,
                                      RegexOptions.None, TimeSpan.FromMilliseconds(200));

                // Examines the domain part of the email and normalizes it.
                string DomainMapper(Match match)
                {
                    // Use IdnMapping class to convert Unicode domain names.
                    var idn = new IdnMapping();

                    // Pull out and process domain name (throws ArgumentException on invalid)
                    string domainName = idn.GetAscii(match.Groups[2].Value);

                    return match.Groups[1].Value + domainName;
                }
            }
            catch (RegexMatchTimeoutException e)
            {
                return false;
            }
            catch (ArgumentException e)
            {
                return false;
            }

            try
            {
                return Regex.IsMatch(email,
                    @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
                    RegexOptions.IgnoreCase, TimeSpan.FromMilliseconds(250));
            }
            catch (RegexMatchTimeoutException)
            {
                return false;
            }
        }


        private static string EncrypytPassword(string password)
        {
            SHA256 sha256 = SHA256.Create();
            ASCIIEncoding encoding = new();
            byte[] stream = null;
            StringBuilder sb = new();
            stream = sha256.ComputeHash(encoding.GetBytes(password));
            for (int i = 0; i < stream.Length; i++) sb.AppendFormat("{0:x2}", stream[i]);
            return sb.ToString();
        }
    }
}
