import express, { Request, Response } from "express";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { int, text, sqliteTable } from "drizzle-orm/sqlite-core";
import { eq } from "drizzle-orm";
import cors from "cors";

// Initialize database
const sqlite = new Database("employees.db");
const db = drizzle(sqlite);

// Define schema
export const employees = sqliteTable("employees", {
	id: int("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	position: text("position").notNull(),
	salary: int("salary"),
});

// Type for employee
type Employee = typeof employees.$inferSelect;
type NewEmployee = typeof employees.$inferInsert;

// Run migrations (or create tables on startup)
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
migrate(db, { migrationsFolder: "./drizzle" });

// Initialize Express
const app = express();
app.use(
	cors({
		origin: true,
		credentials: true,
	})
);
app.use(express.json());

// CREATE - Add new employee
app.post("/employees", (req: Request, res: Response): void => {
	try {
		const { name, email, position, salary } =
			req.body as Partial<NewEmployee>;

		if (!name || !email || !position) {
			res.status(400).json({
				error: "Name, email, and position are required",
			});
			return;
		}

		const result = db
			.insert(employees)
			.values({
				name,
				email,
				position,
				salary: salary || null,
			})
			.run();

		res.status(201).json({
			id: result.lastInsertRowid,
			name,
			email,
			position,
			salary,
		});
	} catch (error) {
		res.status(400).json({ error: (error as Error).message });
	}
});

// READ - Get all employees
app.get("/employees", (req: Request, res: Response): void => {
	try {
		const allEmployees = db.select().from(employees).all();
		res.json(allEmployees);
	} catch (error) {
		res.status(500).json({ error: (error as Error).message });
	}
});

// READ - Get employee by ID
app.get("/employees/:id", (req: Request, res: Response): void => {
	try {
		const { id } = req.params;
		const employee = db
			.select()
			.from(employees)
			.where(eq(employees.id, parseInt(id)))
			.get();

		if (!employee) {
			res.status(404).json({ error: "Employee not found" });
			return;
		}

		res.json(employee);
	} catch (error) {
		res.status(500).json({ error: (error as Error).message });
	}
});

// UPDATE - Update employee
app.put("/employees/:id", (req: Request, res: Response): void => {
	try {
		const { id } = req.params;
		const { name, email, position, salary } =
			req.body as Partial<NewEmployee>;

		const employee = db
			.select()
			.from(employees)
			.where(eq(employees.id, parseInt(id)))
			.get();

		if (!employee) {
			res.status(404).json({ error: "Employee not found" });
			return;
		}

		const updated: NewEmployee = {
			name: name || employee.name,
			email: email || employee.email,
			position: position || employee.position,
			salary: salary !== undefined ? salary : employee.salary,
		};

		db.update(employees)
			.set(updated)
			.where(eq(employees.id, parseInt(id)))
			.run();

		res.json({ id: parseInt(id), ...updated });
	} catch (error) {
		res.status(400).json({ error: (error as Error).message });
	}
});

// DELETE - Remove employee
app.delete("/employees/:id", (req: Request, res: Response): void => {
	try {
		const { id } = req.params;

		const employee = db
			.select()
			.from(employees)
			.where(eq(employees.id, parseInt(id)))
			.get();

		if (!employee) {
			res.status(404).json({ error: "Employee not found" });
			return;
		}

		db.delete(employees)
			.where(eq(employees.id, parseInt(id)))
			.run();

		res.json({
			message: "Employee deleted successfully",
			id: parseInt(id),
		});
	} catch (error) {
		res.status(500).json({ error: (error as Error).message });
	}
});

// Start server
const PORT = process.env.PORT || 3431;
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
