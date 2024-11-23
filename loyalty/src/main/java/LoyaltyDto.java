import java.sql.ResultSet;
import java.sql.SQLException;

public class LoyaltyDto {
    public long id;
    public String userName;
    public String status;
    public int discount;
    public int reservationCount;

    public LoyaltyDto(String userName) {
        id = 0;
        this.userName = userName;
        reservationCount = 0;
        status = "BRONZE";
        discount = 0;
    }

    public LoyaltyDto(ResultSet rs) throws SQLException {
        id = rs.getLong("id");
        userName = rs.getString("username");
        status = rs.getString("status");
        discount = rs.getInt("discount");
        reservationCount = rs.getInt("reservation_count");
    }
}
