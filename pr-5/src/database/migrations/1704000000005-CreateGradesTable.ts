import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CreateGradesTable1704000000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "grades",
        columns: [
          {
            name: "id",
            type: "serial",
            isPrimary: true,
          },
          {
            name: "student_id",
            type: "integer",
            isNullable: false,
          },
          {
            name: "subject_id",
            type: "integer",
            isNullable: false,
          },
          {
            name: "grade",
            type: "decimal",
            precision: 3,
            scale: 1,
            isNullable: false,
          },
          {
            name: "evaluated_at",
            type: "timestamp",
            isNullable: true,
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

    // Create foreign key for student_id
    await queryRunner.createForeignKey(
      "grades",
      new TableForeignKey({
        columnNames: ["student_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "students",
        onDelete: "CASCADE",
      })
    );

    // Create foreign key for subject_id
    await queryRunner.createForeignKey(
      "grades",
      new TableForeignKey({
        columnNames: ["subject_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "subjects",
        onDelete: "CASCADE",
      })
    );

    // Create indexes
    await queryRunner.createIndex(
      "grades",
      new TableIndex({
        name: "idx_grades_student_id",
        columnNames: ["student_id"],
      })
    );

    await queryRunner.createIndex(
      "grades",
      new TableIndex({
        name: "idx_grades_subject_id",
        columnNames: ["subject_id"],
      })
    );

    // Add constraint for grade value
    await queryRunner.query(
      `ALTER TABLE grades ADD CONSTRAINT chk_grade_value CHECK (grade >= 0 AND grade <= 10)`
    );

    // Insert some sample grades
    await queryRunner.query(`
      INSERT INTO grades (student_id, subject_id, grade, evaluated_at) VALUES
        (1, 1, 8.5, CURRENT_TIMESTAMP),
        (1, 2, 9.0, CURRENT_TIMESTAMP),
        (2, 1, 7.5, CURRENT_TIMESTAMP),
        (2, 3, 8.0, CURRENT_TIMESTAMP),
        (3, 2, 9.5, CURRENT_TIMESTAMP),
        (3, 4, 8.5, CURRENT_TIMESTAMP)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("grades");
  }
}
