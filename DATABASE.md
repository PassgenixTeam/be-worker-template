This is the task for AI to generate database schema follow by the instructions.

# Instructions

The database schema should be created at each module folder `src/modules/{module-name}/schema/<table-name>.schema.ts`

Each table should have 3 required fields:

- `id`: Primary key, uuid
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last update

The entity was marked `(OK)` if it has been created.

# Database schema

entity USER { ' (OK)

- ## id : uuid <<PK>>
    name : varchar
    phone : varchar
    zalo_user_id : varchar
    fb_profile_id : varchar
    skill_level : varchar
    gender : varchar
    preferred_areas : text
    status : varchar
    role: varchar
    created_at : timestamptz
    updated_at : timestamptz
    }
