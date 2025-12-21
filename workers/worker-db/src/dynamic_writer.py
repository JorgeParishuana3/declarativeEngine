import time
from psycopg import OperationalError, InterfaceError, IntegrityError
from psycopg.sql import SQL, Identifier, Placeholder
from db_client import get_conn

MAX_DB_RETRIES = 3
RETRY_BACKOFF = 0.3


class DynamicWriterError(Exception):
    pass


def write_json_row(
    *,
    table: str,
    payload: dict,
    conflict_cols: tuple[str, ...] | None = None,
    column_map: dict[str, str] | None = None,  ## Mapeo de columnas (Si no es incluido, se usaran las keys de payload)
):
    if not payload:
        raise DynamicWriterError("Payload vacío")

    # Mapear columnas tipo {"columna del objeto", "columna de la tabla", ...}
    if column_map:
        values = {
            column_map.get(k, k): v
            for k, v in payload.items()
        }
    else:
        values = payload

    columns = list(values.keys())
    params = list(values.values())

    insert_sql = SQL(
        "INSERT INTO {table} ({cols}) VALUES ({vals})"
    ).format(
        table=Identifier(table),
        cols=SQL(", ").join(map(Identifier, columns)),
        vals=SQL(", ").join(Placeholder() * len(columns)),
    )

    last_exc = None
    backoff = RETRY_BACKOFF


    for attempt in range(1, MAX_DB_RETRIES + 1):
        try:
            with get_conn() as conn:
                with conn.transaction():
                    with conn.cursor() as cur:
                        cur.execute(insert_sql, params)
                        break
        except (OperationalError, InterfaceError) as e:
            last_exc = e
            if attempt == MAX_DB_RETRIES:
                break
            time.sleep(backoff)
            backoff *= 2
        except IntegrityError as e:
            print("Integrity Error")
            print("Tabla     :", e.diag.table_name)
            print("Columna   :", e.diag.column_name)
            print("Constraint:", e.diag.constraint_name)
            print("Detalle   :", e.diag.detail)
            print("SQL       :", insert_sql)
            print("Params    :", params)
            break
        except Exception as e:
            print("Error NO esperado escribiendo en BD")
            print("Tipo:", type(e))
            return False
