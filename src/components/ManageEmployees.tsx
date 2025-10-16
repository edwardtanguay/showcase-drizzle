import { useState, useEffect } from "react";
import { Trash2, Plus, Check, X } from "lucide-react";

interface Employee {
	id: number;
	name: string;
	email: string;
	position: string;
	salary: number | null;
}

interface NewEmployeeForm {
	name: string;
	email: string;
	position: string;
	salary: string;
}

export const ManageEmployees = () => {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [editing, setEditing] = useState<number | null>(null);
	const [editData, setEditData] = useState<Partial<Employee>>({});
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>("");
	const [showForm, setShowForm] = useState<boolean>(false);
	const [newEmployee, setNewEmployee] = useState<NewEmployeeForm>({
		name: "",
		email: "",
		position: "",
		salary: "",
	});

	const API_BASE = "http://localhost:3431";

	useEffect(() => {
		fetchEmployees();
	}, []);

	const fetchEmployees = async (): Promise<void> => {
		try {
			setLoading(true);
			const res = await fetch(`${API_BASE}/employees`);
			if (!res.ok) throw new Error("Failed to fetch employees");
			const data: Employee[] = await res.json();
			setEmployees(data);
			setError("");
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: number): Promise<void> => {
		try {
			const res = await fetch(`${API_BASE}/employees/${id}`, {
				method: "DELETE",
			});
			if (!res.ok) throw new Error("Failed to delete employee");
			setEmployees(employees.filter((e) => e.id !== id));
			setError("");
		} catch (err) {
			setError((err as Error).message);
		}
	};

	const handleEditStart = (employee: Employee): void => {
		setEditing(employee.id);
		setEditData({ ...employee });
	};

	const handleEditChange = (field: keyof Employee, value: string): void => {
		setEditData((prev) => ({
			...prev,
			[field]:
				field === "salary"
					? value === ""
						? null
						: parseInt(value)
					: value,
		}));
	};

	const handleEditSave = async (id: number): Promise<void> => {
		try {
			const res = await fetch(`${API_BASE}/employees/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(editData),
			});
			if (!res.ok) throw new Error("Failed to update employee");
			const updated: Employee = await res.json();
			setEmployees(employees.map((e) => (e.id === id ? updated : e)));
			setEditing(null);
			setError("");
		} catch (err) {
			setError((err as Error).message);
		}
	};

	const handleAddEmployee = async (): Promise<void> => {
		try {
			if (
				!newEmployee.name ||
				!newEmployee.email ||
				!newEmployee.position
			) {
				setError("Name, email, and position are required");
				return;
			}

			const res = await fetch(`${API_BASE}/employees`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...newEmployee,
					salary:
						newEmployee.salary === ""
							? null
							: parseInt(newEmployee.salary),
				}),
			});
			if (!res.ok) throw new Error("Failed to add employee");
			const added: Employee = await res.json();
			setEmployees([...employees, added]);
			setNewEmployee({ name: "", email: "", position: "", salary: "" });
			setShowForm(false);
			setError("");
		} catch (err) {
			setError((err as Error).message);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
			<div className="max-w-6xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-4xl font-bold text-white">
						Employee Management
					</h1>
					<button
						onClick={() => setShowForm(!showForm)}
						className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
					>
						<Plus size={20} />
						Add Employee
					</button>
				</div>

				{error && (
					<div className="mb-4 p-4 bg-red-900 text-red-100 rounded-lg">
						{error}
					</div>
				)}

				{showForm && (
					<div className="mb-8 p-6 bg-slate-700 rounded-lg">
						<h2 className="text-xl font-semibold text-white mb-4">
							New Employee
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
							<input
								type="text"
								placeholder="Name"
								value={newEmployee.name}
								onChange={(e) =>
									setNewEmployee({
										...newEmployee,
										name: e.target.value,
									})
								}
								className="px-4 py-2 bg-slate-600 text-white rounded placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<input
								type="email"
								placeholder="Email"
								value={newEmployee.email}
								onChange={(e) =>
									setNewEmployee({
										...newEmployee,
										email: e.target.value,
									})
								}
								className="px-4 py-2 bg-slate-600 text-white rounded placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<input
								type="text"
								placeholder="Position"
								value={newEmployee.position}
								onChange={(e) =>
									setNewEmployee({
										...newEmployee,
										position: e.target.value,
									})
								}
								className="px-4 py-2 bg-slate-600 text-white rounded placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
							<input
								type="number"
								placeholder="Salary (optional)"
								value={newEmployee.salary}
								onChange={(e) =>
									setNewEmployee({
										...newEmployee,
										salary: e.target.value,
									})
								}
								className="px-4 py-2 bg-slate-600 text-white rounded placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
							/>
						</div>
						<div className="flex gap-2">
							<button
								onClick={handleAddEmployee}
								className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
							>
								Save
							</button>
							<button
								onClick={() => setShowForm(false)}
								className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
							>
								Cancel
							</button>
						</div>
					</div>
				)}

				{loading ? (
					<div className="text-center text-white">Loading...</div>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full bg-slate-700 rounded-lg overflow-hidden">
							<thead className="bg-slate-800">
								<tr>
									<th className="px-6 py-4 text-left text-white font-semibold">
										ID
									</th>
									<th className="px-6 py-4 text-left text-white font-semibold">
										Name
									</th>
									<th className="px-6 py-4 text-left text-white font-semibold">
										Email
									</th>
									<th className="px-6 py-4 text-left text-white font-semibold">
										Position
									</th>
									<th className="px-6 py-4 text-left text-white font-semibold">
										Salary
									</th>
									<th className="px-6 py-4 text-left text-white font-semibold">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{employees.map((emp) => (
									<tr
										key={emp.id}
										className="border-t border-slate-600 hover:bg-slate-600 transition"
									>
										<td className="px-6 py-4 text-slate-200">
											{emp.id}
										</td>
										<td className="px-6 py-4">
											{editing === emp.id ? (
												<input
													type="text"
													value={editData.name}
													onChange={(e) =>
														handleEditChange(
															"name",
															e.target.value
														)
													}
													className="w-full px-2 py-1 bg-slate-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											) : (
												<span className="text-slate-200">
													{emp.name}
												</span>
											)}
										</td>
										<td className="px-6 py-4">
											{editing === emp.id ? (
												<input
													type="email"
													value={editData.email}
													onChange={(e) =>
														handleEditChange(
															"email",
															e.target.value
														)
													}
													className="w-full px-2 py-1 bg-slate-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											) : (
												<span className="text-slate-200">
													{emp.email}
												</span>
											)}
										</td>
										<td className="px-6 py-4">
											{editing === emp.id ? (
												<input
													type="text"
													value={editData.position}
													onChange={(e) =>
														handleEditChange(
															"position",
															e.target.value
														)
													}
													className="w-full px-2 py-1 bg-slate-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											) : (
												<span className="text-slate-200">
													{emp.position}
												</span>
											)}
										</td>
										<td className="px-6 py-4">
											{editing === emp.id ? (
												<input
													type="number"
													value={
														editData.salary ?? ""
													}
													onChange={(e) =>
														handleEditChange(
															"salary",
															e.target.value
														)
													}
													className="w-full px-2 py-1 bg-slate-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
												/>
											) : (
												<span className="text-slate-200">
													{emp.salary
														? `$${emp.salary.toLocaleString()}`
														: "N/A"}
												</span>
											)}
										</td>
										<td className="px-6 py-4">
											{editing === emp.id ? (
												<div className="flex gap-2">
													<button
														onClick={() =>
															handleEditSave(
																emp.id
															)
														}
														className="bg-green-600 hover:bg-green-700 p-2 rounded transition"
													>
														<Check
															size={18}
															className="text-white"
														/>
													</button>
													<button
														onClick={() =>
															setEditing(null)
														}
														className="bg-gray-600 hover:bg-gray-700 p-2 rounded transition"
													>
														<X
															size={18}
															className="text-white"
														/>
													</button>
												</div>
											) : (
												<div className="flex gap-2">
													<button
														onClick={() =>
															handleEditStart(emp)
														}
														className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition"
													>
														Edit
													</button>
													<button
														onClick={() =>
															handleDelete(emp.id)
														}
														className="bg-red-600 hover:bg-red-700 p-2 rounded transition"
													>
														<Trash2
															size={18}
															className="text-white"
														/>
													</button>
												</div>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{!loading && employees.length === 0 && (
					<div className="text-center text-slate-400 py-8">
						No employees found
					</div>
				)}
			</div>
		</div>
	);
};
