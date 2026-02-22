export class PointerType {
    public static readonly ACTIVE_PLAYER = new PointerType('active_player');
    public static readonly ACTIVE_PLAYER2 = new PointerType('.active_player');
    public static readonly P_ACTIVE_PLAYER = new PointerType('p_active_player');
    public static readonly P_ACTIVE_PLAYER2 = new PointerType('.p_active_player');
    public static readonly ACTIVE_NPC = new PointerType('active_npc');
    public static readonly ACTIVE_NPC2 = new PointerType('.active_npc');
    public static readonly ACTIVE_LOC = new PointerType('active_loc');
    public static readonly ACTIVE_LOC2 = new PointerType('.active_loc');
    public static readonly ACTIVE_OBJ = new PointerType('active_obj');
    public static readonly ACTIVE_OBJ2 = new PointerType('.active_obj');
    public static readonly FIND_PLAYER = new PointerType('find_player');
    public static readonly FIND_NPC = new PointerType('find_npc');
    public static readonly FIND_LOC = new PointerType('find_loc');
    public static readonly FIND_OBJ = new PointerType('find_obj');
    public static readonly FIND_DB = new PointerType('find_db');
    public static readonly LAST_COM = new PointerType('last_com');
    public static readonly LAST_INT = new PointerType('last_int');
    public static readonly LAST_ITEM = new PointerType('last_item');
    public static readonly LAST_SLOT = new PointerType('last_slot');
    public static readonly LAST_TARGETSLOT = new PointerType('last_targetslot');
    public static readonly LAST_USEITEM = new PointerType('last_useitem');
    public static readonly LAST_USESLOT = new PointerType('last_useslot');

    public static readonly ALL: PointerType[] = Object.values(PointerType).filter((v): v is PointerType => v instanceof PointerType);

    private static readonly NAME_TO_TYPE: Record<string, PointerType> = PointerType.ALL.reduce(
        (acc, type) => {
            acc[type.getName().toLowerCase()] = type;
            return acc;
        },
        {} as Record<string, PointerType>
    );

    private constructor(public readonly representation: string) {}

    public getName(): string {
        for (const key of Object.keys(PointerType)) {
            if ((PointerType as any)[key] === this) return key;
        }
        return '';
    }

    public static forName(name: string): PointerType | undefined {
        return this.NAME_TO_TYPE[name.toLowerCase()];
    }
}
