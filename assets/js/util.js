/**
 * Created by hoangdv on 3/25/2017.
 * File này chứa các hàm js client được sử dụng trên toàn window client
 */

/**
 * Tải xuống một file từ url
 * Không mở popup dạng window.open(url);
 * Trình duyệt sẽ chặn bạn nếu bạn thực hiện action mở popup trong một async (trừ khi bạn cho phép)
 * @param url String Đường dẫn file cần download
 */
function downloadFromUrl(url) {
	var link = document.createElement("a");
	link.download = '';
	link.href = url;
	link.click();
}
