import { ApiProperty } from "@nestjs/swagger";

export class CreateBranchDto {
    @ApiProperty({ description: 'ID de la versión base' })
    versionId: string;

    @ApiProperty({ description: 'Nombre de la nueva rama' })
    branchName: string;

    @ApiProperty({ description: 'Autor de la rama' })
    author: string;
}

export class MergeBranchDto {
    @ApiProperty({ description: 'ID de la versión de origen' })
    sourceId: string;

    @ApiProperty({ description: 'ID de la versión de destino' })
    targetId: string;
}
