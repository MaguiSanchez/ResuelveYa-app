const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			listServices: [],
			username: localStorage.getItem('name'),
			role: localStorage.getItem('role'),
			resetEmail: "",
			clientInfo: null,
			providerInfo: null,
			dataUserLogin: {},
			user: null,
			dataNewPost: {},
			reviews: []
		},
		actions: {
			register: async (values) => {
				try {
					const response = await fetch(process.env.BACKEND_URL + "/api/register", {
						method: "POST",
						body: JSON.stringify(values),
						headers: {
							"content-type": "application/json"
						}
					});
					let data = await response.json();

					return data;
				} catch (e) {
					console.error("Error in registration:", e);
				}
			},

			login: async (dataLogin) => {
				try {
					let response = await fetch(process.env.BACKEND_URL + "/api/login", {
						method: "POST",
						body: JSON.stringify(dataLogin),
						headers: { "content-type": "application/json" }
					});
					let data = await response.json();
					console.log(data);
					if (data.token) {
						console.log(`Welcome ${data.username}`);
						localStorage.setItem('token', data.token);
						localStorage.setItem('name', data.username);
						localStorage.setItem('role', data.role);
						localStorage.setItem('user_id', data.user_id);
						setStore({ username: data.username, role: data.role });
					} else {
						console.log("Something went wrong");
					}
					return data;
				} catch (e) {
					console.error(e);
				}
			},

			logout: () => {
				localStorage.removeItem('token');
				localStorage.removeItem('name');
				localStorage.removeItem('user_id');
				localStorage.removeItem('role');
				setStore({
					username: "",
					user: null,
					clientInfo: null,
					providerInfo: null
				});
				console.log("Logged out successfully!");
			},

			sendCode: async (email) => {
				try {
					const response = await fetch(process.env.BACKEND_URL + "/api/request_reset_password", {
						method: "POST",
						body: JSON.stringify({ email }),
						headers: {
							"content-type": "application/json"
						}
					});
					let data = await response.json();
					console.log(data);

					if (response.ok) {
						setStore({ resetEmail: email });
						return { success: true, message: data.message };
					} else {
						return { success: false, message: data.message };
					}
				} catch (e) {
					console.error("Error al enviar el código:", e);
					return { success: false, message: "Error al enviar el código" };
				}
			},

			newPassword: async (email, reset_code, new_password) => {
				try {
					const response = await fetch(process.env.BACKEND_URL + "/api/reset_password", {
						method: "POST",
						body: JSON.stringify({ email, reset_code, new_password }),
						headers: {
							"content-type": "application/json"
						}
					});

					let data = await response.json();
					console.log(data);

					if (response.ok) {
						return { success: true, message: data.message };
					} else {
						return { success: false, message: data.message };
					}
				} catch (e) {
					console.error("Error in newPassword:", e);
					return { success: false, message: "Error al cambiar la contraseña" };
				}
			},

			getProviderInformation: async () => {
				let token = localStorage.getItem('token');
				if (!token) {
					console.log("First log in to get a token");
					return;
				}
				try {
					const response = await fetch(process.env.BACKEND_URL + "/api/provider_information", {
						method: "GET",
						headers: {
							Authorization: `Bearer ${token}`,
						}
					});
					const data = await response.json();
					if (response.ok) {
						setStore({ providerInfo: data });
					}
					return data;
				} catch (error) {
					console.error("Error fetching provider information:", error);
				}
			},
			getUsers: async (role) => {
				try {
					// La URL siempre incluye el rol para filtrar usuarios
					const url = `${process.env.BACKEND_URL}/api/users?role=${role}`;

					const response = await fetch(url, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${localStorage.getItem("token")}`  // Enviar el token JWT
						}
					});
					const data = await response.json();

					if (response.ok) {
						return data; // Devuelve la lista de usuarios con ese rol
					} else {
						console.error(`Error obteniendo usuarios con rol ${role}:`, data.message);
						return [];
					}
				} catch (err) {
					console.error("Error en getUsers:", err);
					return [];
				}
			},
			deleteUser: async (userId) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/users/${userId}`, {
						method: "DELETE",
						headers: {
							"Authorization": `Bearer ${localStorage.getItem("token")}`,
							"Content-Type": "application/json"
						}
					});

					if (response.ok) {
						const result = await response.json();
						console.log(result.message);
						return { success: true, message: result.message };
					} else {
						const errorData = await response.json();
						console.error("Error al eliminar usuario:", errorData.message);
						return { success: false, message: errorData.message };
					}
				} catch (error) {
					console.error("Error:", error);
					return { success: false, message: "Error en el servidor. Inténtalo de nuevo más tarde." };
				}
			},
			getPostsProviders: async () => {
				try {
					const response = await fetch(process.env.BACKEND_URL + '/api/posts');
					const data = await response.json();
					setStore({ listServices: data });
					return data;
				} catch (err) {
					console.error(err);
				}
			},

			newPostProvider: async (dataPost) => {
				const actions = getActions();
				let token = localStorage.getItem('token');
				try {
					const response = await fetch(process.env.BACKEND_URL + '/api/create_posts', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(dataPost)
					});

					const data = await response.json();
					console.log(data);
					actions.getPostsProviders();
				} catch (err) {
					console.error(err);
				}
			},

			setListServices: (newList) => {
				setStore({ listServices: newList });
			},

			editUserPersonalData: async (userData) => {
				const token = localStorage.getItem("token");
				try {
					const response = await fetch(process.env.BACKEND_URL + "/api/edit_profile", {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify(userData),
					});

					const data = await response.json();
					if (response.ok) {
						setStore({ dataUserLogin: data.new_data });
						return { success: true, message: data.msg };
					} else {
						return { success: false, message: data.msg };
					}
				} catch (error) {
					console.error("Error en editUserProfile:", error);
					return { success: false, message: "Error al actualizar el perfil" };
				}
			},

			editUserPassword: async (currentPassword, newPassword) => {
				const token = localStorage.getItem("token");
				try {
					const response = await fetch(process.env.BACKEND_URL + "/api/edit_profile", {
						method: "PUT",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify({
							password: currentPassword,
							new_password: newPassword
						})
					});

					const data = await response.json();
					if (response.ok) {
						return { success: true, message: data.msg };
					} else {
						return { success: false, message: data.msg };
					}
				} catch (error) {
					console.error("Error en changePassword:", error);
					return { success: false, message: "Error al cambiar la contraseña" };
				}
			},

			// Payment 
			processPayment: async (paymentData) => {
				// console.log("Este es el paymentData:" , paymentData);
				try {
					//const token = localStorage.getItem("token");
					const response = await fetch(process.env.BACKEND_URL + "/api/payments", {
						method: "POST",
						headers: {
							//"Authorization": `Bearer ${token}`,
							"Content-Type": "application/json"
						},
						body: JSON.stringify(paymentData)
					});

					const data = await response.json();
					console.log("Payment response:", data);
					return data;
				} catch (error) {
					console.error("Error in processPayment:", error);
					return { success: false, message: "Error en el procesamiento del pago" };
				}
			},
			getUserInfoById: async (user_id) => {
				const token = localStorage.getItem("token");
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/api/user/${user_id}`, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`
						}
					});
					const data = await response.json();
					if (response.ok) {

						setStore({
							user: data,
						});
						return { success: true, data: data };
					} else {
						console.error("Error obteniendo la información del usuario:", data.message);
						return { success: false, message: data.message };
					}
				} catch (error) {
					console.error("Error en getUserInfoById:", error);
					return { success: false, message: "Error al obtener la información del usuario" };
				}
			},
			setDataNewPost: (dataPost) => {
				setStore({ dataNewPost: dataPost })
			},

			newReview: async (dataReview) => {
				const actions = getActions()
				let token = localStorage.getItem('token')
				try {
					const response = await fetch(process.env.BACKEND_URL + '/api/add_review', {
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify(dataReview)
					})
					const data = await response.json()
					console.log(data)
					actions.getReviews()

				} catch (err) {
					console.error(err)
				}
			},
			getReviews: async () => {
				try {
					const response = await fetch(process.env.BACKEND_URL + '/api/review_posts')

					const data = await response.json();
					setStore({ reviews: data });
					return data;
				} catch (err) {
					console.error(err)
				}
			},
			setReviews: (newList) => {
				setStore({reviews: newList})
			}

		}
	};
};

export default getState;
