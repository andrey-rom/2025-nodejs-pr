import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddUserIdToStudents1704000000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add user_id column to students table
    await queryRunner.addColumn(
      "students",
      new TableColumn({
        name: "user_id",
        type: "uuid",
        isNullable: true,
      })
    );

    // Create foreign key for user_id
    await queryRunner.createForeignKey(
      "students",
      new TableForeignKey({
        columnNames: ["user_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    const table = await queryRunner.getTable("students");
    const foreignKey = table?.foreignKeys.find(
      (fk) => fk.columnNames.indexOf("user_id") !== -1
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey("students", foreignKey);
    }

    // Drop column
    await queryRunner.dropColumn("students", "user_id");
  }
}
