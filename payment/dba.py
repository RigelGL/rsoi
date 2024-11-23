import psycopg2


class Dba:
    @classmethod
    def create_test_database(cls, name, host, user, password):
        try:
            conn = psycopg2.connect(user=user, password=password, host=host)
            conn.autocommit = True
            c = conn.cursor()
            c.execute('CREATE DATABASE {}'.format(name))

            f = open('res/init.sql', 'r', encoding='utf-8')
            sql = f.read()
            f.close()
            c.execute(sql)
            c.close()
            conn.close()
            return True
        except Exception as e:
            print(e)
            return False

    @classmethod
    def drop_test_database(cls, name, host, user, password):
        try:
            conn = psycopg2.connect(user=user, password=password, host=host)
            conn.autocommit = True
            c = conn.cursor()
            c.execute('DROP DATABASE IF EXISTS {}'.format(name))
            c.close()
            conn.close()
            return True
        except Exception as e:
            print(e)
            return False

    def __init__(self, name, host, user, password):
        try:
            self.conn = psycopg2.connect(dbname=name, user=user, password=password, host=host)
            print('Connected to PostgreSQL ' + host + '/' + name + ', as ' + user)
        except Exception as e:
            self.conn = None
            print('Can`t establish connection to database')
            print(e)

    def init_database(self):
        f = open('res/init.sql', 'r', encoding='utf-8')
        sql = f.read()
        f.close()
        c = self.conn.cursor()
        c.execute(sql)
        self.conn.commit()
        c.close()
        print('Database updated')

    def add_payment(self, price):
        cursor = self.conn.cursor()
        cursor.execute(
            'INSERT INTO payment (payment_uid, status, price) '
            'VALUES (gen_random_uuid(), %s, %s) RETURNING payment_uid', ('PAID', price))
        uid = cursor.fetchone()[0]
        self.conn.commit()
        cursor.close()
        return uid

    def get_payment(self, payment_uid):
        cursor = None
        data = None
        try:
            cursor = self.conn.cursor()
            cursor.execute(
                'SELECT payment_uid, status, price FROM payment WHERE payment_uid=%s',
                (payment_uid,))
            e = cursor.fetchone()
            if e is not None:
                data = {'uid': e[0], 'status': e[1], 'price': e[2]}
        except:
            if cursor is not None:
                self.conn.rollback()
        finally:
            if cursor is not None:
                cursor.close()
        return data

    def get_payments(self, uids):
        cursor = None
        payments = []
        try:
            cursor = self.conn.cursor()
            sql = 'SELECT payment_uid, status, price FROM payment'
            arr = []
            if uids is not None:
                sql += ' WHERE payment_uid::text = ANY(%s)'
                arr.append(uids)

            cursor.execute(sql, arr)
            for e in cursor.fetchall():
                payments.append({'uid': e[0], 'status': e[1], 'price': e[2]})
        except Exception as e:
            if cursor is not None:
                self.conn.rollback()
        finally:
            if cursor is not None:
                cursor.close()
        return payments

    def cancel_payment(self, payment_uid):
        cursor = None
        try:
            cursor = self.conn.cursor()
            cursor.execute('UPDATE payment SET status = %s WHERE payment_uid=%s', ('CANCELED', payment_uid))
            self.conn.commit()
        except:
            if cursor is not None:
                self.conn.rollback()
        finally:
            if cursor is not None:
                cursor.close()
