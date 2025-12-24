import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddServiceIdToPhotos1766200000000 implements MigrationInterface {
    name = 'AddServiceIdToPhotos1766200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add serviceId column
        await queryRunner.addColumn('photos', new TableColumn({
            name: 'serviceId',
            type: 'uuid',
            isNullable: true,
        }));

        // Add foreign key constraint
        await queryRunner.createForeignKey('photos', new TableForeignKey({
            columnNames: ['serviceId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'services',
            onDelete: 'SET NULL',
        }));

        // Add index for better query performance
        await queryRunner.query(`CREATE INDEX "idx_photo_service_id" ON "photos" ("serviceId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_photo_service_id"`);
        
        // Drop foreign key
        const table = await queryRunner.getTable('photos');
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.indexOf('serviceId') !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey('photos', foreignKey);
        }

        // Drop column
        await queryRunner.dropColumn('photos', 'serviceId');
    }
}

