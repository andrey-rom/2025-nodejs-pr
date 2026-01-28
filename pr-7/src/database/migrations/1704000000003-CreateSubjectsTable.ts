import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateSubjectsTable1704000000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "subjects",
        columns: [
          {
            name: "id",
            type: "serial",
            isPrimary: true,
          },
          {
            name: "subject_name",
            type: "varchar",
            length: "100",
            isNullable: false,
          },
          {
            name: "description",
            type: "text",
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

    // Insert some default subjects
    await queryRunner.query(`
      INSERT INTO subjects (subject_name, description) VALUES
        ('Mathematics', 'Advanced mathematics and calculus'),
        ('Computer Science', 'Programming and algorithms'),
        ('Physics', 'Classical and modern physics'),
        ('English Literature', 'English language and literature studies'),
        ('History', 'World history and culture')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("subjects");
  }
}
