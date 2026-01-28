import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateStudentsTable1704000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "students",
        columns: [
          {
            name: "id",
            type: "serial",
            isPrimary: true,
          },
          {
            name: "name",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "age",
            type: "integer",
            isNullable: false,
          },
          {
            name: "group",
            type: "integer",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
      true
    );

    // Create index
    await queryRunner.createIndex(
      "students",
      new TableIndex({
        name: "idx_students_group",
        columnNames: ["group"],
      })
    );

    // constraints
    await queryRunner.query(
      `ALTER TABLE students ADD CONSTRAINT chk_age CHECK (age >= 16 AND age <= 100)`
    );
    await queryRunner.query(
      `ALTER TABLE students ADD CONSTRAINT chk_group CHECK ("group" >= 1 AND "group" <= 10)`
    );

    // Insert data
    await queryRunner.query(`
      INSERT INTO students (name, age, "group") VALUES
        ('John Doe', 21, 2),
        ('Jane Doe', 25, 3),
        ('Andrei Ramanenka', 24, 3),
        ('Alice Johnson', 22, 1),
        ('Bob Smith', 24, 2)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("students");
  }
}
