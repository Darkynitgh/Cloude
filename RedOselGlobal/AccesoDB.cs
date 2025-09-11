using Microsoft.Data.SqlClient;
using System.Data;
using System.Text;
using static RedOselGlobal.Models;
using static RedOselGlobal.Models.Pedidos;

namespace RedOselGlobal
{
    public class AccesoDB
    {
        private readonly string _connectionString;
        private SqlConnection _connection;

        public AccesoDB(string connectionString)
        {
            if (string.IsNullOrEmpty(connectionString))
                throw new ArgumentException("Connection string cannot be null or empty.", nameof(connectionString));

            _connectionString = connectionString;
        }

        public AccesoDB() { }


        #region ConfiguracionCorreo

        public string[] recupera_configuracion()
        {
            string[] result = new string[5];
            SqlConnection cnn = new(_connectionString);
            SqlCommand cmd = new("dbo.Correo_Recupera_Configuracion", cnn);
            try
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                cnn.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        result[0] = Convert.ToString(reader["host"]);
                    if (!reader.IsDBNull(1))
                        result[1] = Convert.ToString(reader["correo"]);
                    if (!reader.IsDBNull(2))
                        result[2] = Convert.ToString(reader["puerto"]);
                    if (!reader.IsDBNull(3))
                        result[3] = Convert.ToString(reader["password"]);
                    if (!reader.IsDBNull(3))
                        result[4] = Convert.ToString(reader["ssl"]);
                }
            }
            catch (Exception ex)
            {
                ex.Message.ToString();
            }
            finally
            {
                cnn.Close();
                cmd.Dispose();
                cnn.Dispose();
            }
            return result;
        }

        #endregion


        #region Usuarios

        public Usuarios Usuario_Acceso(string usuario, string password)
        {
            var usuarios = new Usuarios();
            usuarios.mensaje = "";


            _connection = new(_connectionString);
            var cmd = new SqlCommand("dbo.Usuario_Acceso", _connection);
            try
            {
                cmd.Parameters.Add("@usuario", SqlDbType.VarChar).Value = usuario;
                cmd.Parameters.Add("@password", SqlDbType.VarChar).Value = password;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                _connection.Open();

                SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        usuarios.id_usuario = Convert.ToInt32(reader["id_usuario"]);
                    if (!reader.IsDBNull(1))
                        usuarios.nombre = Convert.ToString(reader["nombre"]);
                    if (!reader.IsDBNull(2))
                        usuarios.id_estatus = Convert.ToInt32(reader["id_estatus"]);
                    if (!reader.IsDBNull(3))
                        usuarios.id_perfil = Convert.ToInt32(reader["id_perfil"]);
                    if (!reader.IsDBNull(4))
                        usuarios.solicitud_recuperar_contrasena = Convert.ToInt32(reader["solicitud_recuperar_contrasena"]);
                    if (!reader.IsDBNull(5))
                        usuarios.perfil = Convert.ToString(reader["perfil"]);
                    if (!reader.IsDBNull(5))
                        usuarios.id_estatus_perfil = Convert.ToInt32(reader["id_estatus_perfil"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return usuarios;
        }

        public string Usuario_VerificaLogin(int id_usuario)
        {
            var res = "";

            _connection = new(_connectionString);
            SqlCommand cmd = new("dbo.Usuario_VerificaLogin", _connection);
            try
            {
                cmd.Parameters.Add("@id_usuario", SqlDbType.VarChar).Value = id_usuario;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        res = Convert.ToString(reader["log_actual"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return res;
        }

        public string Usuario_VerificaPermisos(int id_perfil, string vista)
        {
            var res = "";

            _connection = new(_connectionString);
            SqlCommand cmd = new("dbo.[Usuario_VerificaPermisos]", _connection);
            try
            {
                cmd.Parameters.Add("@id_perfil", SqlDbType.Int).Value = id_perfil;
                cmd.Parameters.Add("@vista", SqlDbType.VarChar).Value = vista;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        res = Convert.ToString(reader["acceso"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return res;
        }

        public string Usuario_ActualizaLogin(int id_usuario)
        {
            var res = "";

            _connection = new(_connectionString);
            SqlCommand cmd = new("dbo.Usuario_ActualizaLogin", _connection);
            try
            {
                cmd.Parameters.Add("@id_usuario", SqlDbType.VarChar).Value = id_usuario;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        res = Convert.ToString(reader["mensaje"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return res;
        }

        public List<Usuarios> GetUsuarios(string usuario, string correo)
        {
            Usuarios usuarios;
            List<Usuarios> listaUsuarios = new();

            _connection = new(_connectionString);
            SqlCommand cmd = new("dbo.Usuarios_Consulta", _connection);
            try
            {
                cmd.Parameters.Add("@usuario", SqlDbType.VarChar).Value = usuario;
                cmd.Parameters.Add("@correo", SqlDbType.VarChar).Value = correo;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    usuarios = new Usuarios();
                    if (!reader.IsDBNull(0))
                        usuarios.id_usuario = Convert.ToInt32(reader["id_usuario"]);
                    if (!reader.IsDBNull(1))
                        usuarios.usuario = Convert.ToString(reader["usuario"]);
                    if (!reader.IsDBNull(2))
                        usuarios.nombre = Convert.ToString(reader["nombre"]);
                    if (!reader.IsDBNull(3))
                        usuarios.correo_electronico = Convert.ToString(reader["correo_electronico"]);
                    if (!reader.IsDBNull(4))
                        usuarios.estatus = Convert.ToString(reader["estatus"]);
                    if (!reader.IsDBNull(5))
                        usuarios.perfil = Convert.ToString(reader["perfil"]);
                    if (!reader.IsDBNull(5))
                        usuarios.telefono = Convert.ToString(reader["telefono"]);
                    listaUsuarios.Add(usuarios);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return listaUsuarios;
        }

        public Usuarios GetUsuario(int id_usuario)
        {
            Usuarios usuarios = new();

            _connection = new(_connectionString);
            SqlCommand cmd = new("dbo.Usuario_Recupera", _connection);
            try
            {
                cmd.Parameters.Add("@id_usuario", SqlDbType.Int).Value = id_usuario;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        usuarios.id_usuario = Convert.ToInt32(reader["id_usuario"]);
                    if (!reader.IsDBNull(1))
                        usuarios.usuario = Convert.ToString(reader["usuario"]);
                    if (!reader.IsDBNull(2))
                        usuarios.contrasena = Convert.ToString(reader["contrasena"]);
                    if (!reader.IsDBNull(3))
                        usuarios.nombre = Convert.ToString(reader["nombre"]);
                    if (!reader.IsDBNull(4))
                        usuarios.apellidos = Convert.ToString(reader["apellidos"]);
                    if (!reader.IsDBNull(5))
                        usuarios.telefono = Convert.ToString(reader["telefono"]);
                    if (!reader.IsDBNull(6))
                        usuarios.id_perfil = Convert.ToInt32(reader["id_perfil"]);
                    if (!reader.IsDBNull(7))
                        usuarios.id_estatus = Convert.ToInt32(reader["id_estatus"]);
                    if (!reader.IsDBNull(8))
                        usuarios.correo_electronico = Convert.ToString(reader["correo_electronico"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return usuarios;
        }

        public string UsuarioInserta(string usuario, string contrasena, string nombre, string apellidos, string correo, string telefono, int id_perfil, int id_estatus)
        {
            var res = "";

            _connection = new(_connectionString);
            SqlCommand cmd = new("dbo.Usuario_Inserta", _connection);
            try
            {
                cmd.Parameters.Add("@usuario", SqlDbType.VarChar).Value = usuario;
                cmd.Parameters.Add("@contrasena", SqlDbType.VarChar).Value = contrasena;
                cmd.Parameters.Add("@nombre", SqlDbType.VarChar).Value = nombre;
                cmd.Parameters.Add("@apellidos", SqlDbType.VarChar).Value = apellidos;
                cmd.Parameters.Add("@correo", SqlDbType.VarChar).Value = correo;
                cmd.Parameters.Add("@telefono", SqlDbType.VarChar).Value = telefono;
                cmd.Parameters.Add("@id_perfil", SqlDbType.Int).Value = id_perfil;
                cmd.Parameters.Add("@id_estatus", SqlDbType.Int).Value = id_estatus;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        res = Convert.ToString(reader["resultado"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return res;
        }

        public int UsuarioInsertaCiacPO2014(string usuario,string nombre, string apellidos, int estatus, string nombreEncargado, string usuarioAuxSage)
        {
            int res = 0;
            string plainQuery 
            = @"
                INSERT INTO usuariosciac
                (
                    [usuario],
                    [nombre], 
                    [status],
                    [nombreencargado], 
                    [usuarioauxi],
                    [accesoespecial]
                )
                SELECT 
                    @usuario, 
                    TRIM(CONCAT(TRIM(@nombre),' ', TRIM(@apellidos))), 
                    @estatus,
                    @nombre_encargado,
                    @usuario_aux_sage,
                    0

                SELECT SCOPE_IDENTITY() id_anterior          
                ";
            _connection = new(_connectionString);
            SqlCommand cmd = new(plainQuery, _connection);
            try
            {
                cmd.Parameters.Add("@usuario", SqlDbType.VarChar).Value = usuario;
                cmd.Parameters.Add("@nombre", SqlDbType.VarChar).Value = nombre;
                cmd.Parameters.Add("@apellidos", SqlDbType.VarChar).Value = apellidos;
                cmd.Parameters.Add("@estatus", SqlDbType.Int).Value = estatus;
                cmd.Parameters.Add("@nombre_encargado", SqlDbType.VarChar).Value = nombreEncargado;
                cmd.Parameters.Add("@usuario_aux_sage", SqlDbType.VarChar).Value = usuarioAuxSage;
                cmd.CommandType = CommandType.Text;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        res = Convert.ToInt32(reader["id_anterior"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return res;
        }

        public string UsuarioActualiza(int id_usuario, string usuario, string contrasena, string nombre, string apellidos, string correo, string telefono, int id_perfil, int id_estatus, int cambia_contrasena = 0, int origen_netcore = 0)
        {
            var res = "";

            _connection = new(_connectionString);
            SqlCommand cmd = new("dbo.Usuario_Actualiza", _connection);
            try
            {
                cmd.Parameters.Add("@id_usuario", SqlDbType.Int).Value = id_usuario;
                cmd.Parameters.Add("@usuario", SqlDbType.VarChar).Value = usuario;
                cmd.Parameters.Add("@contrasena", SqlDbType.VarChar).Value = contrasena;
                cmd.Parameters.Add("@nombre", SqlDbType.VarChar).Value = nombre;
                cmd.Parameters.Add("@apellidos", SqlDbType.VarChar).Value = apellidos;
                cmd.Parameters.Add("@correo", SqlDbType.VarChar).Value = correo;
                cmd.Parameters.Add("@telefono", SqlDbType.VarChar).Value = telefono;
                cmd.Parameters.Add("@id_perfil", SqlDbType.Int).Value = id_perfil;
                cmd.Parameters.Add("@id_estatus", SqlDbType.Int).Value = id_estatus;
                cmd.Parameters.Add("@cambia_contrasena", SqlDbType.Int).Value = cambia_contrasena;
                cmd.Parameters.Add("@origen_netcore", SqlDbType.Int).Value = origen_netcore;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        res = Convert.ToString(reader["resultado"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return res;
        }

        public int UsuarioActualizaCiacPO2014(string nombre, string apellidos,int estatus, string nombreEncargado,string usuarioAuxSage, int id_anterior)
        {
            int res = 0;
            string plainQuery
            = @"
               UPDATE
                    uc
                SET 
                    uc.nombre = TRIM(CONCAT(TRIM(@nombre),' ', TRIM(@apellidos))),
                    uc.status = @estatus,
                    uc.nombreencargado = @nombre_encargado,
                    uc.usuarioauxi = @usuario_aux_sage
                FROM dbo.usuariosciac uc
                WHERE uc.id = @id_anterior     

                SELECT @@ROWCOUNT rows_affected
                ";
            _connection = new(_connectionString);
            SqlCommand cmd = new(plainQuery, _connection);
            try
            {
                cmd.Parameters.Add("@nombre", SqlDbType.VarChar).Value = nombre;
                cmd.Parameters.Add("@apellidos", SqlDbType.VarChar).Value = apellidos;
                cmd.Parameters.Add("@estatus", SqlDbType.Int).Value = estatus;
                cmd.Parameters.Add("@nombre_encargado", SqlDbType.VarChar).Value = nombreEncargado;
                cmd.Parameters.Add("@usuario_aux_sage", SqlDbType.VarChar).Value = usuarioAuxSage;
                cmd.Parameters.Add("@id_anterior", SqlDbType.Int).Value = id_anterior;
                cmd.CommandType = CommandType.Text;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        res = Convert.ToInt32(reader["rows_affected"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return res;
        }

        public string UsuarioElimina(int id_usuario)
        {
            var res = "";

            _connection = new(_connectionString);
            SqlCommand cmd = new("dbo.Usuario_Elimina", _connection);
            try
            {
                cmd.Parameters.Add("@id_usuario", SqlDbType.Int).Value = id_usuario;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        res = Convert.ToString(reader["resultado"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return res;
        }

        public Usuarios PeticionRestablecimientoContrasena(string correo, string token)
        {
            var res = new Usuarios();

            _connection = new(_connectionString);
            SqlCommand cmd = new("dbo.Usuario_PeticionRestablecimiento_Contrasena", _connection);
            try
            {
                cmd.Parameters.Add("@correo", SqlDbType.VarChar).Value = correo;
                cmd.Parameters.Add("@token", SqlDbType.VarChar).Value = token;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        res.nombre = Convert.ToString(reader["nombre"]);
                    if (!reader.IsDBNull(0))
                        res.mensaje = Convert.ToString(reader["mensaje"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return res;
        }

        public string CambiaContrasena(string token, string contrasena)
        {
            var res = "";

            _connection = new(_connectionString);
            SqlCommand cmd = new("dbo.Usuario_RestableceContrasena", _connection);
            try
            {
                cmd.Parameters.Add("@contrasena", SqlDbType.VarChar).Value = contrasena;
                cmd.Parameters.Add("@token", SqlDbType.VarChar).Value = token;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        res = Convert.ToString(reader["mensaje"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return res;
        }

        #endregion Usuarios


        #region Perfiles


        public List<Perfil> GetPerfiles()
        {
            List<Perfil> listaClaves = new();
            Perfil usuarios;
            _connection = new(_connectionString);
            SqlCommand cmd = new("dbo.Perfil_Consulta", _connection);
            try
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    usuarios = new();
                    if (!reader.IsDBNull(0))
                        usuarios.id_perfil = Convert.ToInt32(reader["id_perfil"]);
                    if (!reader.IsDBNull(1))
                        usuarios.perfil = Convert.ToString(reader["perfil"]);
                    if (!reader.IsDBNull(2))
                        usuarios.estatus = Convert.ToString(reader["estatus"]);
                    listaClaves.Add(usuarios);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return listaClaves;
        }

        public Perfil GetPerfil(int id_perfil)
        {
            Perfil usuarios = new();
            _connection = new(_connectionString);
            SqlCommand cmd = new("[dbo].[Perfil_Recupera]", _connection);
            try
            {
                cmd.Parameters.Add("@id_perfil", SqlDbType.Int).Value = id_perfil;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    usuarios = new Perfil();
                    if (!reader.IsDBNull(0))
                        usuarios.id_perfil = Convert.ToInt32(reader["id_perfil"]);
                    if (!reader.IsDBNull(1))
                        usuarios.perfil = Convert.ToString(reader["perfil"]);
                    if (!reader.IsDBNull(2))
                        usuarios.id_estatus = Convert.ToString(reader["id_estatus"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return usuarios;
        }

        public string PerfilInserta(string descripcion, int id_estatus, int tipo)
        {
            var res = "";
            _connection = new(_connectionString);
            SqlCommand cmd = new("[dbo].[Perfil_Inserta]", _connection);
            try
            {
                cmd.Parameters.Add("@descripcion", SqlDbType.VarChar).Value = descripcion;
                cmd.Parameters.Add("@id_estatus", SqlDbType.Int).Value = id_estatus;
                cmd.Parameters.Add("@tipo", SqlDbType.Int).Value = tipo;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        res = Convert.ToString(reader["resultado"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return res;
        }

        public string PerfilActualiza(int id_perfil, string descripcion, int id_estatus)
        {
            var res = "";
            _connection = new(_connectionString);
            SqlCommand cmd = new("[dbo].[Perfil_Actualiza]", _connection);
            try
            {
                cmd.Parameters.Add("@id_perfil", SqlDbType.Int).Value = id_perfil;
                cmd.Parameters.Add("@descripcion", SqlDbType.VarChar).Value = descripcion;
                cmd.Parameters.Add("@id_estatus", SqlDbType.Int).Value = id_estatus;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        res = Convert.ToString(reader["resultado"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return res;
        }

        public string PerfilElimina(int id_perfil)
        {
            var res = "";
            _connection = new(_connectionString);
            SqlCommand cmd = new("[dbo].[Perfil_Elimina]", _connection);
            try
            {
                cmd.Parameters.Add("@id_perfil", SqlDbType.Int).Value = id_perfil;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        res = Convert.ToString(reader["resultado"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return res;
        }


        public string ConsultaMenuCiac()
        {
            var result = new StringBuilder();
            _connection = new(_connectionString);
            SqlCommand cmd = new("dbo.Opciones_Consulta", _connection);
            try
            {
                cmd.Parameters.Add("@netcore", SqlDbType.Int).Value = 1;
                cmd.Parameters.Add("@json", SqlDbType.Int).Value = 1;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    result.Append(reader.GetString(0));
                }

                return result.ToString();
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
        }


        public List<Opciones> ConsultaAccesos(int id_perfil, int netcore = 0, int tipoPerfil = 0, bool json = false)
        {
            List<Opciones> listaClaves = new();
            Opciones usuarios;
            _connection = new(_connectionString);
            SqlCommand cmd = new("dbo.Opciones_Consulta", _connection);
            try
            {
                cmd.Parameters.Add("@id_perfil", SqlDbType.Int).Value = id_perfil;
                cmd.Parameters.Add("@netcore", SqlDbType.Int).Value = netcore;
                cmd.Parameters.Add("@tipoPerfil", SqlDbType.Int).Value = tipoPerfil;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    usuarios = new();
                    if (!reader.IsDBNull(0))
                        usuarios.id_opcion = Convert.ToInt32(reader["id_opcion"]);
                    if (!reader.IsDBNull(1))
                        usuarios.descripcion = Convert.ToString(reader["descripcion"]);
                    if (!reader.IsDBNull(2))
                        usuarios.acceso = Convert.ToInt32(reader["acceso"]);
                    listaClaves.Add(usuarios);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return listaClaves;
        }

        public string OpcionesInserta(int id_perfil, string jsonOpciones, int id_usuario, int netCore = 0)
        {

            var res = "";
            _connection = new(_connectionString);
            SqlCommand cmd = new("[dbo].[Opciones_Inserta]", _connection);
            try
            {
                cmd.Parameters.Add("@id_perfil", SqlDbType.Int).Value = id_perfil;
                cmd.Parameters.Add("@jsonOpciones", SqlDbType.VarChar).Value = jsonOpciones;
                cmd.Parameters.Add("@id_usuario", SqlDbType.Int).Value = id_usuario;
                cmd.Parameters.Add("@netcore", SqlDbType.Int).Value = netCore;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        res = Convert.ToString(reader["resultado"]);
                }
            }
            catch (Exception ex)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return res;
        }



        #endregion Perfiles


        #region Opciones

        public List<Opciones> Opciones_Consulta_Menu(int id_perfil, int tipoAdministrador = 0)
        {
            List<Opciones> listaMenu = new();
            Opciones opciones;

            _connection = new(_connectionString);
            var cmd = new SqlCommand("dbo.Opciones_Consulta_Menu", _connection);
            try
            {
                cmd.Parameters.Add("@id_perfil", SqlDbType.Int).Value = id_perfil;
                cmd.Parameters.Add("@tipo_administrador", SqlDbType.Int).Value = tipoAdministrador;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    opciones = new Opciones();
                    if (!reader.IsDBNull(0))
                        opciones.id_opcion = Convert.ToInt32(reader["id_opcion"]);
                    if (!reader.IsDBNull(1))
                        opciones.controller = Convert.ToString(reader["controller"]);
                    if (!reader.IsDBNull(2))
                        opciones.pagina = Convert.ToString(reader["pagina"]);
                    if (!reader.IsDBNull(3))
                        opciones.descripcion = Convert.ToString(reader["descripcion"]);
                    if (!reader.IsDBNull(4))
                        opciones.icono = Convert.ToString(reader["icono"]);
                    listaMenu.Add(opciones);
                    opciones.listaOpciones = Opciones_Consulta_SubMenu(opciones.id_opcion, id_perfil, tipoAdministrador);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return listaMenu;
        }

        private List<Opciones> Opciones_Consulta_SubMenu(int id_opcion_padre, int id_perfil, int tipoAdministrador = 0)
        {
            List<Opciones> listaOpciones = new();
            Opciones opciones;

            _connection = new(_connectionString);
            var cmd = new SqlCommand("dbo.Opciones_Consulta_Menu", _connection);
            try
            {
                cmd.Parameters.Add("@id_opcion_padre", SqlDbType.Int).Value = id_opcion_padre;
                cmd.Parameters.Add("@id_perfil", SqlDbType.Int).Value = id_perfil;
                cmd.Parameters.Add("@tipo_administrador", SqlDbType.Int).Value = tipoAdministrador;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    opciones = new Opciones();
                    if (!reader.IsDBNull(0))
                        opciones.id_opcion = Convert.ToInt32(reader["id_opcion"]);
                    if (!reader.IsDBNull(1))
                        opciones.controller = Convert.ToString(reader["controller"]);
                    if (!reader.IsDBNull(2))
                        opciones.pagina = Convert.ToString(reader["pagina"]);
                    if (!reader.IsDBNull(3))
                        opciones.descripcion = Convert.ToString(reader["descripcion"]);
                    if (!reader.IsDBNull(4))
                        opciones.id_opcion_padre = Convert.ToInt32(reader["id_opcion_padre"]);
                    listaOpciones.Add(opciones);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return listaOpciones;
        }

        #endregion Opciones


        #region Claves

        public List<Claves> GetClaves(int id_tipo_clave, int opcion = 0)
        {
            List<Claves> listaClaves = [];
            Claves usuarios;

            _connection = new SqlConnection(_connectionString);
            SqlCommand cmd = new("[dbo].[Claves_Consulta_TipoClave]", _connection);
            try
            {
                cmd.Parameters.Add("@id_tipo_clave", SqlDbType.Int).Value = id_tipo_clave;
                cmd.Parameters.Add("@opcion", SqlDbType.Int).Value = opcion;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                if (opcion == 0)
                {
                    while (reader.Read())
                    {
                        usuarios = new Claves();
                        if (!reader.IsDBNull(0))
                            usuarios.id_clave = Convert.ToInt32(reader["id_clave"]);
                        if (!reader.IsDBNull(1))
                            usuarios.cadena = Convert.ToString(reader["cadena"]);
                        if (!reader.IsDBNull(1))
                            usuarios.mensaje = Convert.ToString(reader["Desc_SAT"]);
                        listaClaves.Add(usuarios);
                    }
                }
                else if (opcion == -1)
                {
                    while (reader.Read())
                    {
                        usuarios = new Claves();
                        if (!reader.IsDBNull(0))
                            usuarios.id_clave = Convert.ToInt32(reader["id_clave"]);
                        if (!reader.IsDBNull(1))
                            usuarios.cadena = Convert.ToString(reader["cadena"]);
                        if (!reader.IsDBNull(1))
                            usuarios.mensaje = Convert.ToString(reader["Desc_SAT"]);
                        listaClaves.Add(usuarios);
                    }
                }
                else
                {
                    while (reader.Read())
                    {
                        usuarios = new Claves();
                        if (!reader.IsDBNull(0))
                            usuarios.id_clave = Convert.ToInt32(reader["id_clave"]);
                        if (!reader.IsDBNull(1))
                            usuarios.cadena = Convert.ToString(reader["cadena"]);
                        if (!reader.IsDBNull(2))
                            usuarios.fondo = Convert.ToString(reader["fondo"]);
                        if (!reader.IsDBNull(3))
                            usuarios.icono = Convert.ToString(reader["icono"]);
                        listaClaves.Add(usuarios);
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return listaClaves;
        }

        public string[] RecuperaConfiguracionCorreoNotificaciones()
        {
            string[] result = new string[5];

            _connection = new SqlConnection(_connectionString);
            SqlCommand cmd = new("dbo.Correo_Recupera_Configuracion", _connection);
            try
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        result[0] = Convert.ToString(reader["host"]);
                    if (!reader.IsDBNull(1))
                        result[1] = Convert.ToString(reader["correo"]);
                    if (!reader.IsDBNull(2))
                        result[2] = Convert.ToString(reader["puerto"]);
                    if (!reader.IsDBNull(3))
                        result[3] = Convert.ToString(reader["password"]);
                    if (!reader.IsDBNull(3))
                        result[4] = Convert.ToString(reader["ssl"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return result;
        }

        public string Claves_Recupera_CorreoContacto()
        {
            var res = "";
            _connection = new SqlConnection(_connectionString);
            SqlCommand cmd = new("dbo.Claves_Recupera_CorreoContacto", _connection);
            try
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;
                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    if (!reader.IsDBNull(0))
                        res = Convert.ToString(reader["correo_contacto"]);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return res;
        }


        #endregion Claves


        #region Familia

        public List<Dictionary<string, string>> FamiliasConsulta(int idTipoNaturaleza)
        {
            List<Dictionary<string, string>> lista = new();
            Dictionary<string, string> opciones;

            _connection = new(_connectionString);
            var cmd = new SqlCommand("dbo.Familia_Consulta", _connection);
            try
            {
                cmd.Parameters.Add("opcion", SqlDbType.Int).Value = 1;
                cmd.Parameters.Add("id_tipo_naturaleza", SqlDbType.Int).Value = idTipoNaturaleza;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    opciones = new();
                    if (!reader.IsDBNull(0))
                        opciones["idFamilia"] = Convert.ToString(reader["id_familia"]);
                    if (!reader.IsDBNull(1))
                        opciones["descripcion"] = Convert.ToString(reader["descripcion"]);
                    if (!reader.IsDBNull(2))
                        opciones["productosRelacionados"] = Convert.ToString(reader["productos_relacionados"]);
                    if (!reader.IsDBNull(3))
                        opciones["dsEstatus"] = Convert.ToString(reader["ds_estatus"]);
                    if (!reader.IsDBNull(4))
                        opciones["tipoNaturaleza"] = Convert.ToString(reader["tipoNaturaleza"]);
                    lista.Add(opciones);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return lista;
        }

        #endregion


        #region RedOsel 

        /// <summary>
        /// Recupera colores de las familias industriales
        /// </summary>
        /// <returns></returns>
        public static List<Colores> GetColoresIndustriales(string familia, string linea)
        {
            List<Colores> lista = [];
            Colores opcion;

            var _connection = new SqlConnection(Environment.GetEnvironmentVariable("ConnectionStringPedidos"));
            var cmd = new SqlCommand("dbo.sps_ColoresT", _connection);
            try
            {
                cmd.Parameters.Add("Familia", SqlDbType.VarChar).Value = familia;
                cmd.Parameters.Add("Linea", SqlDbType.VarChar).Value = linea;


                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    opcion = new()
                    {
                        Codigo = !reader.IsDBNull("Codigo") ? Convert.ToString(reader.GetValue("Codigo")) : "",
                        Descripcion = !reader.IsDBNull("Descripcion") ? Convert.ToString(reader.GetValue("Descripcion")) : ""
                    };

                    lista.Add(opcion);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return lista;
        }

        /// <summary>
        /// Recupera Familias Industriales
        /// </summary>
        /// <returns></returns>
        public static List<Pedidos> GetFamilias()
        {
            List<Pedidos> lista = [];
            Pedidos opcion;

            var _connection = new SqlConnection(Environment.GetEnvironmentVariable("ConnectionStringPedidos"));
            var cmd = new SqlCommand("dbo.sps_FamiliasCotizador", _connection);
            try
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    opcion = new();

                    opcion.Linea = !reader.IsDBNull("Linea") ? Convert.ToString(reader.GetValue("Linea")) : "";
                    opcion.Familia = !reader.IsDBNull("Familia") ? Convert.ToString(reader.GetValue("Familia")) : "";

                    lista.Add(opcion);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return lista;
        }

        /// <summary>
        /// Recupera detalle para el cotizador 
        /// </summary>
        /// <param name="linea"></param>
        /// <param name="color"></param>
        /// <returns></returns>
        public static object GetDetalleCotizador(string linea, string color)
        {
            object a = new();
            string[] val = { "8660", "8670", "8680" };
            PedidosAgua opcion = new();
            PedidosSolventes pedidosSolventes = new();

            var _connection = new SqlConnection(Environment.GetEnvironmentVariable("ConnectionStringPedidos"));
            var cmd = new SqlCommand("dbo.sps_InformacionKitsIndustrialesPisosT", _connection);
            try
            {
                cmd.Parameters.Add("Linea", SqlDbType.VarChar).Value = linea;
                cmd.Parameters.Add("Color", SqlDbType.VarChar).Value = color;


                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    if (val.Any(linea.Contains))
                    {
                        opcion.CodigoBaseGal = !reader.IsDBNull(reader.GetOrdinal("Codigo_Base_Gal")) ? reader.GetString(reader.GetOrdinal("Codigo_Base_Gal")) : "";
                        opcion.DescripcionBG = !reader.IsDBNull(reader.GetOrdinal("DescripcionBG")) ? reader.GetString(reader.GetOrdinal("DescripcionBG")) : "";
                        opcion.PrecioDBG = !reader.IsDBNull(reader.GetOrdinal("PrecioDBG")) ? reader.GetDouble(reader.GetOrdinal("PrecioDBG")) : 0;
                        opcion.PrecioPBG = !reader.IsDBNull(reader.GetOrdinal("PrecioPBG")) ? reader.GetDouble(reader.GetOrdinal("PrecioPBG")) : 0;
                        opcion.ProporcionBaseG = !reader.IsDBNull(reader.GetOrdinal("ProporcionBaseG")) ? reader.GetInt32(reader.GetOrdinal("ProporcionBaseG")) : 0;
                        opcion.CodigoCatalizadorGal = !reader.IsDBNull(reader.GetOrdinal("Codigo_Catalizador_Gal")) ? reader.GetString(reader.GetOrdinal("Codigo_Catalizador_Gal")) : "";
                        opcion.DescripcionCG = !reader.IsDBNull(reader.GetOrdinal("DescripcionCG")) ? reader.GetString(reader.GetOrdinal("DescripcionCG")) : "";
                        opcion.PrecioDCG = !reader.IsDBNull(reader.GetOrdinal("PrecioDCG")) ? reader.GetDouble(reader.GetOrdinal("PrecioDCG")) : 0;
                        opcion.PrecioPCG = !reader.IsDBNull(reader.GetOrdinal("PrecioPCG")) ? reader.GetDouble(reader.GetOrdinal("PrecioPCG")) : 0;
                        opcion.ProporcionCatalizadorG = !reader.IsDBNull(reader.GetOrdinal("ProporcionCatalizadorG")) ? reader.GetInt32(reader.GetOrdinal("ProporcionCatalizadorG")) : 0;
                        opcion.CodigoBaseCub = !reader.IsDBNull(reader.GetOrdinal("Codigo_Base_Cub")) ? reader.GetString(reader.GetOrdinal("Codigo_Base_Cub")) : "";
                        opcion.DescripcionBQ = !reader.IsDBNull(reader.GetOrdinal("DescripcionBQ")) ? reader.GetString(reader.GetOrdinal("DescripcionBQ")) : "";
                        opcion.PrecioDBQ = !reader.IsDBNull(reader.GetOrdinal("PrecioDBQ")) ? reader.GetDouble(reader.GetOrdinal("PrecioDBQ")) : 0;
                        opcion.PrecioPBQ = !reader.IsDBNull(reader.GetOrdinal("PrecioPBQ")) ? reader.GetDouble(reader.GetOrdinal("PrecioPBQ")) : 0;
                        opcion.ProporcionBaseQ = !reader.IsDBNull(reader.GetOrdinal("ProporcionBaseQ")) ? reader.GetInt32(reader.GetOrdinal("ProporcionBaseQ")) : 0;
                        opcion.CodigoCatalizadorCub = !reader.IsDBNull(reader.GetOrdinal("Codigo_Catalizador_Cub")) ? reader.GetString(reader.GetOrdinal("Codigo_Catalizador_Cub")) : "";
                        opcion.DescripcionCQ = !reader.IsDBNull(reader.GetOrdinal("DescripcionCQ")) ? reader.GetString(reader.GetOrdinal("DescripcionCQ")) : "";
                        opcion.PrecioDCQ = !reader.IsDBNull(reader.GetOrdinal("PrecioDCQ")) ? reader.GetDouble(reader.GetOrdinal("PrecioDCQ")) : 0;
                        opcion.PrecioPCQ = !reader.IsDBNull(reader.GetOrdinal("PrecioPCQ")) ? reader.GetDouble(reader.GetOrdinal("PrecioPCQ")) : 0;
                        opcion.ProporcionCatalizadorQ = !reader.IsDBNull(reader.GetOrdinal("ProporcionCatalizadorQ")) ? reader.GetInt32(reader.GetOrdinal("ProporcionCatalizadorQ")) : 0;
                        a = opcion;
                    }
                    else
                    {
                        pedidosSolventes.Id = !reader.IsDBNull(reader.GetOrdinal("Id")) ? reader.GetInt32(reader.GetOrdinal("Id")) : 0;
                        pedidosSolventes.Color = !reader.IsDBNull(reader.GetOrdinal("Color")) ? reader.GetString(reader.GetOrdinal("Color")) : "";
                        pedidosSolventes.Nombre = !reader.IsDBNull(reader.GetOrdinal("Nombre")) ? reader.GetString(reader.GetOrdinal("Nombre")) : "";
                        pedidosSolventes.DescripcionColor = !reader.IsDBNull(reader.GetOrdinal("Descripcion_Color")) ? reader.GetString(reader.GetOrdinal("Descripcion_Color")) : "";
                        pedidosSolventes.CodigoBaseGal = !reader.IsDBNull(reader.GetOrdinal("Codigo_Base_Gal")) ? reader.GetString(reader.GetOrdinal("Codigo_Base_Gal")) : "";
                        pedidosSolventes.DescripcionBG = !reader.IsDBNull(reader.GetOrdinal("DescripcionBG")) ? reader.GetString(reader.GetOrdinal("DescripcionBG")) : "";
                        pedidosSolventes.PrecioDBG = !reader.IsDBNull(reader.GetOrdinal("PrecioDBG")) ? reader.GetDouble(reader.GetOrdinal("PrecioDBG")) : 0;
                        pedidosSolventes.PrecioPBG = !reader.IsDBNull(reader.GetOrdinal("PrecioPBG")) ? reader.GetDouble(reader.GetOrdinal("PrecioPBG")) : 0;
                        pedidosSolventes.CodigoCatalizadorGal = !reader.IsDBNull(reader.GetOrdinal("Codigo_Catalizador_Gal")) ? reader.GetString(reader.GetOrdinal("Codigo_Catalizador_Gal")) : "";
                        pedidosSolventes.DescripcionCG = !reader.IsDBNull(reader.GetOrdinal("DescripcionCG")) ? reader.GetString(reader.GetOrdinal("DescripcionCG")) : "";
                        pedidosSolventes.PrecioDCG = !reader.IsDBNull(reader.GetOrdinal("PrecioDCG")) ? reader.GetDouble(reader.GetOrdinal("PrecioDCG")) : 0;
                        pedidosSolventes.PrecioPCG = !reader.IsDBNull(reader.GetOrdinal("PrecioPCG")) ? reader.GetDouble(reader.GetOrdinal("PrecioPCG")) : 0;
                        pedidosSolventes.ProporcionSolvG = !reader.IsDBNull(reader.GetOrdinal("ProporcionSolvG")) ? reader.GetInt32(reader.GetOrdinal("ProporcionSolvG")) : 0;
                        pedidosSolventes.ProporcionColoranteG = !reader.IsDBNull(reader.GetOrdinal("ProporcionColoranteG")) ? reader.GetInt32(reader.GetOrdinal("ProporcionColoranteG")) : 0;
                        pedidosSolventes.CodigoBaseCub = !reader.IsDBNull(reader.GetOrdinal("Codigo_Base_Cub")) ? reader.GetString(reader.GetOrdinal("Codigo_Base_Cub")) : "";
                        pedidosSolventes.DescripcionBQ = !reader.IsDBNull(reader.GetOrdinal("DescripcionBQ")) ? reader.GetString(reader.GetOrdinal("DescripcionBQ")) : "";
                        pedidosSolventes.PrecioDBQ = !reader.IsDBNull(reader.GetOrdinal("PrecioDBQ")) ? reader.GetDouble(reader.GetOrdinal("PrecioDBQ")) : (double?)null;
                        pedidosSolventes.PrecioPBQ = !reader.IsDBNull(reader.GetOrdinal("PrecioPBQ")) ? reader.GetDouble(reader.GetOrdinal("PrecioPBQ")) : (double?)null;
                        pedidosSolventes.CodigoCatalizadorCub = !reader.IsDBNull(reader.GetOrdinal("Codigo_Catalizador_Cub")) ? reader.GetString(reader.GetOrdinal("Codigo_Catalizador_Cub")) : "";
                        pedidosSolventes.DescripcionCQ = !reader.IsDBNull(reader.GetOrdinal("DescripcionCQ")) ? reader.GetString(reader.GetOrdinal("DescripcionCQ")) : "";
                        pedidosSolventes.PrecioDCQ = !reader.IsDBNull(reader.GetOrdinal("PrecioDCQ")) ? reader.GetDouble(reader.GetOrdinal("PrecioDCQ")) : (double?)null;
                        pedidosSolventes.PrecioPCQ = !reader.IsDBNull(reader.GetOrdinal("PrecioPCQ")) ? reader.GetDouble(reader.GetOrdinal("PrecioPCQ")) : (double?)null;
                        pedidosSolventes.ProporcionSolvQ = !reader.IsDBNull(reader.GetOrdinal("ProporcionSolvQ")) ? reader.GetInt32(reader.GetOrdinal("ProporcionSolvQ")) : 0;
                        pedidosSolventes.ProporcionColoranteQ = !reader.IsDBNull(reader.GetOrdinal("ProporcionColoranteQ")) ? reader.GetInt32(reader.GetOrdinal("ProporcionColoranteQ")) : 0;
                        pedidosSolventes.PrecioDColoranteGal = !reader.IsDBNull(reader.GetOrdinal("PrecioD_Colorante_Gal")) ? reader.GetDouble(reader.GetOrdinal("PrecioD_Colorante_Gal")) : 0;
                        pedidosSolventes.PrecioDColoranteCub = !reader.IsDBNull(reader.GetOrdinal("PrecioD_Colorante_Cub")) ? reader.GetDouble(reader.GetOrdinal("PrecioD_Colorante_Cub")) : 0;
                        pedidosSolventes.PrecioPColoranteGal = !reader.IsDBNull(reader.GetOrdinal("PrecioP_Colorante_Gal")) ? reader.GetDouble(reader.GetOrdinal("PrecioP_Colorante_Gal")) : 0;
                        pedidosSolventes.PrecioPColoranteCub = !reader.IsDBNull(reader.GetOrdinal("PrecioP_Colorante_Cub")) ? reader.GetDouble(reader.GetOrdinal("PrecioP_Colorante_Cub")) : 0;
                        pedidosSolventes.CodigoSolvente = !reader.IsDBNull(reader.GetOrdinal("Codigo_Solvente")) ? reader.GetString(reader.GetOrdinal("Codigo_Solvente")) : "";
                        pedidosSolventes.DescripcionS = !reader.IsDBNull(reader.GetOrdinal("DescripcionS")) ? reader.GetString(reader.GetOrdinal("DescripcionS")) : "";
                        pedidosSolventes.PrecioSD = !reader.IsDBNull(reader.GetOrdinal("PrecioSD")) ? reader.GetDouble(reader.GetOrdinal("PrecioSD")) : 0;
                        pedidosSolventes.PrecioSP = !reader.IsDBNull(reader.GetOrdinal("PrecioSP")) ? reader.GetDouble(reader.GetOrdinal("PrecioSP")) : 0;
                        pedidosSolventes.Status = !reader.IsDBNull(reader.GetOrdinal("Status")) ? int.Parse(reader.GetString(reader.GetOrdinal("Status"))) : 0;
                        pedidosSolventes.Familia = !reader.IsDBNull(reader.GetOrdinal("Familia")) ? reader.GetString(reader.GetOrdinal("Familia")) : "";
                        pedidosSolventes.IdGaleria = !reader.IsDBNull(reader.GetOrdinal("IdGaleria")) ? reader.GetInt32(reader.GetOrdinal("IdGaleria")) : 0;
                        pedidosSolventes.IdResina = !reader.IsDBNull(reader.GetOrdinal("IdResina")) ? reader.GetInt32(reader.GetOrdinal("IdResina")) : 0;
                        pedidosSolventes.FormulaG = !reader.IsDBNull(reader.GetOrdinal("FormulaG")) ? reader.GetString(reader.GetOrdinal("FormulaG")) : "";
                        pedidosSolventes.FormulaQ = !reader.IsDBNull(reader.GetOrdinal("FormulaQ")) ? reader.GetString(reader.GetOrdinal("FormulaQ")) : "";
                        pedidosSolventes.FormulaQ18 = !reader.IsDBNull(reader.GetOrdinal("FormulaQ18")) ? reader.GetString(reader.GetOrdinal("FormulaQ18")) : "";
                        pedidosSolventes.CodigoBaseCub18 = !reader.IsDBNull(reader.GetOrdinal("Codigo_Base_Cub18")) ? reader.GetString(reader.GetOrdinal("Codigo_Base_Cub18")) : "";
                        pedidosSolventes.DescripcionBQ18 = !reader.IsDBNull(reader.GetOrdinal("DescripcionBQ18")) ? reader.GetString(reader.GetOrdinal("DescripcionBQ18")) : "";
                        pedidosSolventes.PrecioDBQ18 = !reader.IsDBNull(reader.GetOrdinal("PrecioDBQ18")) ? reader.GetDouble(reader.GetOrdinal("PrecioDBQ18")) : 0;
                        pedidosSolventes.PrecioPBQ18 = !reader.IsDBNull(reader.GetOrdinal("PrecioPBQ18")) ? reader.GetDouble(reader.GetOrdinal("PrecioPBQ18")) : 0;
                        pedidosSolventes.CodigoCatalizadorCub18 = !reader.IsDBNull(reader.GetOrdinal("Codigo_Catalizador_Cub18")) ? reader.GetString(reader.GetOrdinal("Codigo_Catalizador_Cub18")) : "";
                        pedidosSolventes.DescripcionCQ18 = !reader.IsDBNull(reader.GetOrdinal("DescripcionCQ18")) ? reader.GetString(reader.GetOrdinal("DescripcionCQ18")) : "";
                        pedidosSolventes.PrecioDCQ18 = !reader.IsDBNull(reader.GetOrdinal("PrecioDCQ18")) ? reader.GetDouble(reader.GetOrdinal("PrecioDCQ18")) : 0;
                        pedidosSolventes.PrecioPCQ18 = !reader.IsDBNull(reader.GetOrdinal("PrecioDCQ18")) ? reader.GetDouble(reader.GetOrdinal("PrecioPCQ18")) : 0;
                        pedidosSolventes.ProporcionSolvQ18 = !reader.IsDBNull(reader.GetOrdinal("PrecioDCQ18")) ? reader.GetInt32(reader.GetOrdinal("ProporcionSolvQ18")) : 0;
                        pedidosSolventes.ProporcionColoranteQ18 = !reader.IsDBNull(reader.GetOrdinal("PrecioDCQ18")) ? reader.GetInt32(reader.GetOrdinal("ProporcionColoranteQ18")) : 0;

                        a = pedidosSolventes;

                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return a;
        }

        /// <summary>
        /// Recupera detalle de capturas por el distribuidor dado de un SAGE Principal
        /// </summary>
        /// <param name="idSemestre"></param>
        /// <param name="codigoSage"></param>
        /// <param name="codigoDistribuidor"></param>
        /// <returns></returns>
        public static List<DatosPresupuesto> GetDetalleCapturasDistribuidor(int idSemestre, string codigoSage, string codigoDistribuidor)
        {
            List<DatosPresupuesto> lista = [];
            DatosPresupuesto opcion;

            var _connection = new SqlConnection(Environment.GetEnvironmentVariable("ConnectionStringPresupuestos"));
            var cmd = new SqlCommand("dbo.sps_VentasMayoristasDistribuidor", _connection);
            try
            {
                cmd.Parameters.Add("Id", SqlDbType.NVarChar).Value = idSemestre;
                cmd.Parameters.Add("CveMay", SqlDbType.NVarChar).Value = codigoSage;
                cmd.Parameters.Add("CveDis", SqlDbType.NVarChar).Value = codigoDistribuidor;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    opcion = new();

                    opcion.Id = !reader.IsDBNull("id") ? ((int)reader.GetValue("Id")) : 0;
                    opcion.IdSemestre = !reader.IsDBNull("IdSemestre") ? Convert.ToString((int)reader.GetValue("IdSemestre")) : "";
                    opcion.CveMayorista = !reader.IsDBNull("CveMayo") ? (string)reader.GetValue("CveMayo") : "";
                    opcion.CveDistribuidor = !reader.IsDBNull("CveDist") ? (string)reader.GetValue("CveDist") : "";
                    opcion.Nombre = !reader.IsDBNull("Nombre") ? (string)reader.GetValue("Nombre") : "";
                    opcion.Anio = !reader.IsDBNull("Año") ? Convert.ToInt32(reader.GetValue("Año")) : 0;
                    opcion.Mes = !reader.IsDBNull("Mes") ? Convert.ToInt32(reader.GetValue("Mes")) : 0;
                    opcion.Venta = !reader.IsDBNull("Venta") ? Convert.ToDecimal(reader.GetValue("Venta")) : 0;
                    opcion.VentaInicial = !reader.IsDBNull("VentaIni") ? Convert.ToDecimal(reader.GetValue("VentaIni")) : 0;
                    opcion.LitrosNormalizados = !reader.IsDBNull("LitrosNorm") ? Convert.ToDecimal(reader.GetValue("LitrosNorm")) : 0;
                    opcion.LitrosNormalizadosInicial = !reader.IsDBNull("LitrosNormI") ? Convert.ToDecimal(reader.GetValue("LitrosNormI")) : 0;

                    lista.Add(opcion);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return lista;
        }

        /// <summary>
        /// Recupera todas las capturas del SAGE Principal realizadas de sus distribuidores
        /// </summary>
        /// <param name="idSemestre"></param>
        /// <param name="codigoSage"></param>
        /// <returns></returns>
        public static List<DatosPresupuesto> GetDetalleCapturasDistribuidores(int idSemestre, string codigoSage)
        {
            List<DatosPresupuesto> lista = [];
            DatosPresupuesto opcion;

            var _connection = new SqlConnection(Environment.GetEnvironmentVariable("ConnectionStringPresupuestos"));
            var cmd = new SqlCommand("dbo.sps_VentasMayoristas", _connection);
            try
            {
                cmd.Parameters.Add("Id", SqlDbType.NVarChar).Value = idSemestre;
                cmd.Parameters.Add("CveMay", SqlDbType.NVarChar).Value = codigoSage;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    opcion = new();

                    opcion.Id = !reader.IsDBNull("id") ? ((int)reader.GetValue("Id")) : 0;
                    opcion.IdSemestre = !reader.IsDBNull("IdSemestre") ? Convert.ToString((int)reader.GetValue("IdSemestre")) : "";
                    opcion.CveMayorista = !reader.IsDBNull("CveMayo") ? (string)reader.GetValue("CveMayo") : "";
                    opcion.CveDistribuidor = !reader.IsDBNull("CveDist") ? (string)reader.GetValue("CveDist") : "";
                    opcion.Nombre = !reader.IsDBNull("Nombre") ? (string)reader.GetValue("Nombre") : "";
                    opcion.Anio = !reader.IsDBNull("Año") ? Convert.ToInt32(reader.GetValue("Año")) : 0;
                    opcion.Mes = !reader.IsDBNull("Mes") ? Convert.ToInt32(reader.GetValue("Mes")) : 0;
                    opcion.Venta = !reader.IsDBNull("Venta") ? Convert.ToDecimal(reader.GetValue("Venta")) : 0;
                    opcion.VentaInicial = !reader.IsDBNull("VentaIni") ? Convert.ToDecimal(reader.GetValue("VentaIni")) : 0;
                    opcion.LitrosNormalizados = !reader.IsDBNull("LitrosNorm") ? Convert.ToDecimal(reader.GetValue("LitrosNorm")) : 0;
                    opcion.LitrosNormalizadosInicial = !reader.IsDBNull("LitrosNormI") ? Convert.ToDecimal(reader.GetValue("LitrosNormI")) : 0;

                    lista.Add(opcion);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return lista;
        }

        public static List<DatosPresupuesto> GetDistribuidores(string codigoSage)
        {
            List<DatosPresupuesto> lista = [];
            DatosPresupuesto opcion;

            var _connection = new SqlConnection(Environment.GetEnvironmentVariable("ConnectionStringPresupuestos"));
            var cmd = new SqlCommand("dbo.sps_CargaDistribuidores", _connection);
            try
            {
                cmd.Parameters.Add("Cliente", SqlDbType.NVarChar).Value = codigoSage;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    opcion = new();

                    opcion.Cliente = !reader.IsDBNull("CCLIENTE") ? (string)reader.GetValue("CCLIENTE") : "";
                    opcion.Nombre = !reader.IsDBNull("CNOMBRE") ? (string)reader.GetValue("CNOMBRE") : "";

                    lista.Add(opcion);
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return lista;
        }


        /// <summary>
        /// Recupera información general del semestre activo de Pinturas Osel
        /// </summary>
        /// <returns></returns>
        public static DatosPresupuesto GetSemestre()
        {
            DatosPresupuesto opciones = new();

            var _connection = new SqlConnection(Environment.GetEnvironmentVariable("ConnectionStringPresupuestos"));
            var cmd = new SqlCommand("dbo.sps_semestres", _connection);
            try
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    opciones.Id = !reader.IsDBNull("Id") ? ((int)reader.GetValue("Id")) : 0;
                    opciones.AnioInicial = !reader.IsDBNull("AñoInicial") ? ((int)reader.GetValue("AñoInicial")) : 0;
                    opciones.MesInicial = !reader.IsDBNull("MesInicial") ? ((int)reader.GetValue("MesInicial")) : 1;
                    opciones.AnioFinal = !reader.IsDBNull("AñoFinal") ? ((int)reader.GetValue("AñoFinal")) : 0;
                    opciones.MesFinal = !reader.IsDBNull("MesFinal") ? ((int)reader.GetValue("MesFinal")) : 0;
                    opciones.Descripcion = !reader.IsDBNull("Descripcion") ? (string)reader.GetValue("Descripcion") : "";
                    opciones.Estatus = !reader.IsDBNull("Status") ? Convert.ToInt32((string)reader.GetValue("Status")) : 0;
                    opciones.FechaInicial = !reader.IsDBNull("FechaInicial") ? Convert.ToDateTime(reader.GetValue("FechaInicial")).ToString("dd/MM/yyyy") : "";
                    opciones.FechaFinal = !reader.IsDBNull("FechaFinal") ? Convert.ToDateTime(reader.GetValue("FechaFinal")).ToString("dd/MM/yyyy") : "";
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return opciones;
        }


        /// <summary>
        /// Inserta/Actualiza registros de venta por distribuidor dado el mes y año y Codigo Sage Mayorista
        /// </summary>
        /// <param name="idSemestre"></param>
        /// <param name="codigoSage"></param>
        /// <param name="claveDistribuidor"></param>
        /// <param name="anio"></param>
        /// <param name="mes"></param>
        /// <param name="venta"></param>
        /// <returns></returns>
        public static async Task CapturaDistribuidoresIndirectosInserta(int idSemestre, string codigoSage, string claveDistribuidor, string anio, string mes, float venta)
        {
            var _connection = new SqlConnection(Environment.GetEnvironmentVariable("ConnectionStringPresupuestos"));
            var cmd = new SqlCommand("dbo.spi_InsertarCapturasDD", _connection);
            try
            {
                cmd.Parameters.Add("@IdSemestre", SqlDbType.Int).Value = idSemestre;
                cmd.Parameters.Add("@Cliente", SqlDbType.VarChar).Value = codigoSage;
                cmd.Parameters.Add("@DistribuidorI", SqlDbType.VarChar).Value = claveDistribuidor;
                cmd.Parameters.Add("@Año", SqlDbType.VarChar).Value = anio;
                cmd.Parameters.Add("@Mes", SqlDbType.VarChar).Value = mes;
                cmd.Parameters.Add("@Venta", SqlDbType.Float).Value = venta;


                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                await _connection.OpenAsync();
                await cmd.ExecuteNonQueryAsync();
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                await _connection.CloseAsync();
                await cmd.DisposeAsync();
                await _connection.DisposeAsync();
            }

            return;
        }

        public static async Task CapturaDistribuidoresIndirectosElimina(int idCaptura)
        {
            var _connection = new SqlConnection(Environment.GetEnvironmentVariable("ConnectionStringPresupuestos"));
            var cmd = new SqlCommand("dbo.spd_EliminaMovimientoVenta", _connection);
            try
            {
                cmd.Parameters.Add("@Id", SqlDbType.Int).Value = idCaptura;

                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                await _connection.OpenAsync();
                await cmd.ExecuteNonQueryAsync();
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                await _connection.CloseAsync();
                await cmd.DisposeAsync();
                await _connection.DisposeAsync();
            }
            return;
        }


        /// <summary>
        /// Recupera nombre del "Cliente" usando su "clave Sage"
        /// </summary>
        /// <param name="codigoSage"></param>
        /// <returns></returns>
        public static DatosPresupuesto GetCliente(string codigoSage)
        {
            DatosPresupuesto ds = new();

            var _connection = new SqlConnection(Environment.GetEnvironmentVariable("ConnectionStringSOIBodegas"));
            var cmd = new SqlCommand("dbo.sps_ClientesSOI_Bodegas", _connection);
            try
            {
                cmd.Parameters.Add("Cliente", SqlDbType.NVarChar).Value = codigoSage;
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                _connection.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    ds.Cliente = !reader.IsDBNull("CNOMBRE") ? (string)reader.GetValue("CNOMBRE") : "";
                }
            }
            catch (Exception)
            {
                throw;
            }
            finally
            {
                _connection.Close();
                cmd.Dispose();
                _connection.Dispose();
            }
            return ds;
        }

        #endregion RedOsel


        public string ExecuteQuery(string json, string storedProcedure)
        {
            var result = new StringBuilder();

            using (var cnn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(storedProcedure, cnn))
            {
                cmd.Parameters.Add(new SqlParameter("json", SqlDbType.NVarChar) { Value = json });
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                try
                {
                    cnn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            result.Append(reader.GetString(0)); // Use StringBuilder
                        }
                    }
                }
                catch (Exception ex)
                {
                    // Log or handle exception as needed
                    throw new InvalidOperationException("An error occurred while executing the query, DETALLE: " + ex.Message);
                }
            }

            return result.ToString();
        }

        public string ExecuteQuery(string storedProcedure)
        {
            var result = new StringBuilder();

            using (var cnn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(storedProcedure, cnn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                try
                {
                    cnn.Open();
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            result.Append(reader.GetString(0)); // Use StringBuilder
                        }
                    }
                }
                catch (Exception ex)
                {
                    // Log or handle exception as needed
                    throw new InvalidOperationException("An error occurred while executing the query, DETALLE: " + ex.Message);
                }
            }

            return result.ToString();
        }

        public async Task<string> ExecuteQueryAsync(string json, string storedProcedure)
        {
            var result = new StringBuilder();

            using (var cnn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(storedProcedure, cnn))
            {
                cmd.Parameters.Add(new SqlParameter("json", SqlDbType.NVarChar) { Value = json });
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                try
                {
                    await cnn.OpenAsync(); // Use async to open the connection

                    using (var reader = await cmd.ExecuteReaderAsync()) // Use async for executing the reader
                    {
                        while (await reader.ReadAsync()) // Use async for reading
                        {
                            result.Append(reader.GetString(0)); // Append results using StringBuilder
                        }
                    }
                }
                catch (Exception ex)
                {
                    // Log or handle exception as needed
                    throw new InvalidOperationException("An error occurred while executing the query, DETALLE: " + ex.Message);
                }
            }

            return result.ToString(); // Return the result as a string
        }



        public async Task<string> ExecuteQueryAsync(string storedProcedure)
        {
            var result = new StringBuilder();

            using (var cnn = new SqlConnection(_connectionString))
            using (var cmd = new SqlCommand(storedProcedure, cnn))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.CommandTimeout = 180;

                try
                {
                    await cnn.OpenAsync(); // Use async to open the connection

                    using (var reader = await cmd.ExecuteReaderAsync()) // Use async for executing the reader
                    {
                        while (await reader.ReadAsync()) // Use async for reading
                        {
                            result.Append(reader.GetString(0)); // Append results using StringBuilder
                        }
                    }
                }
                catch (Exception ex)
                {
                    // Log or handle exception as needed
                    throw new InvalidOperationException("An error occurred while executing the query, DETALLE: " + ex.Message);
                }
            }

            return result.ToString(); // Return the result as a string
        }
    }
}
